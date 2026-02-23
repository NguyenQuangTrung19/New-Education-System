import json
import sys
import collections
from ortools.sat.python import cp_model

def solve_timetable(input_data):
    """
    Solves the school timetable scheduling problem using the CP-SAT solver.
    """
    # --- 1. PARSE INPUT DATA ---
    weekly_struct = input_data.get("weeklyStructure", {})
    num_days = weekly_struct.get("days", 5)
    periods_per_day = weekly_struct.get("periodsPerDay", 8)
    
    classes_data = input_data.get("classes", [])
    teachers_data = input_data.get("teachers", [])
    
    # Pre-process assignments for easier access
    # List of (teacher_id, class_id, subject_id, required_periods)
    assignments = []
    teacher_time_off = collections.defaultdict(list)
    
    for t in teachers_data:
        t_id = t["id"]
        for assign in t.get("assignments", []):
            assignments.append({
                "teacher_id": t_id,
                "class_id": assign["classId"],
                "subject_id": assign.get("subjectId", t.get("subjects", [""])[0]),
                "periods": assign["periods"]
            })
            
        # Parse time off (day index 0-4, period index 0-7)
        for time_off in t.get("timeOff", []):
            day = time_off["day"]
            periods = time_off["periods"]
            for p in periods:
                teacher_time_off[t_id].append((day, p))

    classes = [c["id"] for c in classes_data]
    teachers = [t["id"] for t in teachers_data]

    # --- 2. CREATE MODEL ---
    model = cp_model.CpModel()
    
    # --- 3. VARIABLES ---
    # x[t, c, s, d, p] is 1 if teacher 't' teaches class 'c' subject 's' on day 'd' period 'p'
    x = {}
    for a in assignments:
        t = a["teacher_id"]
        c = a["class_id"]
        s = a["subject_id"]
        for d in range(num_days):
            for p in range(periods_per_day):
                x[t, c, s, d, p] = model.NewBoolVar(f'x_t{t}_c{c}_s{s}_d{d}_p{p}')

    # --- 4. HARD CONSTRAINTS ---

    # H1: Meet exact required periods per assignment
    for a in assignments:
        t = a["teacher_id"]
        c = a["class_id"]
        s = a["subject_id"]
        required_periods = a["periods"]
        model.Add(sum(x[t, c, s, d, p] for d in range(num_days) for p in range(periods_per_day)) == required_periods)

    # H2: A teacher can teach at most one class per period
    for t in teachers:
        for d in range(num_days):
            for p in range(periods_per_day):
                # Sum of all assignments for this teacher in this slot <= 1
                teacher_vars = [x[a["teacher_id"], a["class_id"], a["subject_id"], d, p] for a in assignments if a["teacher_id"] == t]
                if teacher_vars:
                    model.Add(sum(teacher_vars) <= 1)

    # H3: A class can have at most one teacher/subject per period
    for c in classes:
        for d in range(num_days):
            for p in range(periods_per_day):
                # Sum of all assignments for this class in this slot <= 1
                class_vars = [x[a["teacher_id"], a["class_id"], a["subject_id"], d, p] for a in assignments if a["class_id"] == c]
                if class_vars:
                    model.Add(sum(class_vars) <= 1)

    # H4: Teacher time off (Hard restriction)
    for t in teachers:
        for (off_d, off_p) in teacher_time_off.get(t, []):
            teacher_vars = [x[a["teacher_id"], a["class_id"], a["subject_id"], off_d, off_p] for a in assignments if a["teacher_id"] == t]
            if teacher_vars:
                model.Add(sum(teacher_vars) == 0)


    # --- 5. SOFT CONSTRAINTS (Optimization) ---
    objective_terms = []

    # S1: Minimize gaps for teachers
    # A gap happens if a teacher is idle in period 'p' but teaches in some period before 'p' and some period after 'p' on the same day.
    # We penalize each idle period if bounded by active periods.
    gap_penalty = 5
    for t in teachers:
        for d in range(num_days):
            # Is the teacher active at all during period p?
            is_active = []
            for p in range(periods_per_day):
                active_vars = [x[a["teacher_id"], a["class_id"], a["subject_id"], d, p] for a in assignments if a["teacher_id"] == t]
                if active_vars:
                    is_active.append(sum(active_vars))
                else:
                    is_active.append(0)
            
            # To measure gaps, we track the first and last period taught.
            # CP-SAT allows doing this efficiently using boolean variables.
            for p in range(1, periods_per_day - 1):
                # has_taught_before = sum(is_active[0:p]) > 0
                has_taught_before = model.NewBoolVar(f"taught_before_t{t}_d{d}_p{p}")
                model.AddMaxEquality(has_taught_before, is_active[0:p] if type(is_active[0]) is not int else [])
                
                # has_taught_after = sum(is_active[p+1:]) > 0
                has_taught_after = model.NewBoolVar(f"taught_after_t{t}_d{d}_p{p}")
                model.AddMaxEquality(has_taught_after, is_active[p+1:] if type(is_active[-1]) is not int else [])
                
                # is_gap = not active AND taught_before AND taught_after
                is_gap = model.NewBoolVar(f"is_gap_t{t}_d{d}_p{p}")
                # We can express this using AddBoolAnd or linear constraints.
                # is_gap = has_taught_before AND has_taught_after AND NOT is_active[p]
                
                active_var_b = model.NewBoolVar(f"active_b_t{t}_d{d}_p{p}")
                if type(is_active[p]) is not int:
                    model.Add(active_var_b == is_active[p])
                else:
                    model.Add(active_var_b == 0) # if no assignment mapped to this slot for teacher
                
                model.AddBoolAnd([has_taught_before, has_taught_after, active_var_b.Not()]).OnlyEnforceIf(is_gap)
                model.AddBoolOr([has_taught_before.Not(), has_taught_after.Not(), active_var_b]).OnlyEnforceIf(is_gap.Not())
                
                # Add gap to objective
                objective_terms.append(gap_penalty * is_gap)

    # Set objective: minimize penalties
    model.Minimize(sum(objective_terms))

    # --- 6. SOLVE ---
    solver = cp_model.CpSolver()
    # Configuration
    solver.parameters.max_time_in_seconds = 10.0 # Time limit
    solver.parameters.num_search_workers = 8     # Parallel solving
    
    status = solver.Solve(model)

    # --- 7. FORMAT RESULT ---
    result = {
        "status": solver.StatusName(status),
        "score": solver.ObjectiveValue() if status in (cp_model.OPTIMAL, cp_model.FEASIBLE) else None,
        "wallTime": solver.WallTime(),
        "schedule": []
    }

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for a in assignments:
            t = a["teacher_id"]
            c = a["class_id"]
            s = a["subject_id"]
            for d in range(num_days):
                for p in range(periods_per_day):
                    if solver.BooleanValue(x[t, c, s, d, p]):
                        result["schedule"].append({
                            "day": d,
                            "period": p,
                            "teacherId": t,
                            "classId": c,
                            "subjectId": s
                        })
                        
    return result

if __name__ == '__main__':
    # Typically would read from stdin or a file
    # Example input data
    input_data_json = sys.stdin.read()
    if input_data_json:
        input_data = json.loads(input_data_json)
        result = solve_timetable(input_data)
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "No input provided"}))
