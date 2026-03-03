const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = 'C:\\Users\\ACER\\Documents\\Workspace\\Web\\NewEdu\\NewEduSystem\\.agents\\workflows';

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Map the list of URLs based on known structures of the skill-repositories you provided
const skillsToFetch = [
    { url: 'https://raw.githubusercontent.com/vercel-labs/skills/main/skills/find-skills/skill.md', name: 'find-skills.md' },
    { url: 'https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/vercel-react-best-practices/skill.md', name: 'vercel-react-best-practices.md' },
    { url: 'https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/web-design-guidelines/skill.md', name: 'web-design-guidelines.md' },
    { url: 'https://raw.githubusercontent.com/remotion-dev/skills/main/skills/remotion-best-practices/skill.md', name: 'remotion-best-practices.md' },
    { url: 'https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/skill.md', name: 'frontend-design.md' },
    { url: 'https://raw.githubusercontent.com/inference-sh-9/skills/main/skills/agent-tools/skill.md', name: 'agent-tools.md' },
    { url: 'https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/vercel-composition-patterns/skill.md', name: 'vercel-composition-patterns.md' },
    { url: 'https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/skills/ui-ux-pro-max/skill.md', name: 'ui-ux-pro-max.md' },
    { url: 'https://raw.githubusercontent.com/supabase/agent-skills/main/skills/supabase-postgres-best-practices/skill.md', name: 'supabase-postgres-best-practices.md' },
    { url: 'https://raw.githubusercontent.com/anthropics/skills/main/skills/webapp-testing/skill.md', name: 'webapp-testing.md' },
    { url: 'https://raw.githubusercontent.com/anthropics/skills/main/skills/mcp-builder/skill.md', name: 'mcp-builder.md' }
];

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            if (res.statusCode === 200) {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    // Try to extract only what we need if it contains valid content 
                    fs.writeFileSync(dest, data);
                    resolve();
                });
            } else if (res.statusCode === 404) {
               // Fallback format if `skills/<skill>/skill.md` doesn't exist
               const fallbackUrl = url.replace('/skills/', '/').replace('/skill.md', '.md');
               console.log(`404 Default, trying fallback: ${fallbackUrl}`);
               
               https.get(fallbackUrl, (res2) => {
                   if(res2.statusCode === 200) {
                        let data = '';
                        res2.on('data', chunk => data += chunk);
                        res2.on('end', () => {
                            fs.writeFileSync(dest, data);
                            resolve();
                        });
                   } else {
                       reject(new Error(`Failed to fetch ${url} or ${fallbackUrl}. Status: ${res2.statusCode}`));
                   }
               }).on('error', reject);
            } else {
               reject(new Error(`HTTP status ${res.statusCode} for ${url}`));
            }
        });
        
        req.on('error', reject);
    });
}

async function run() {
    let successCount = 0;
    for (const skill of skillsToFetch) {
        try {
            console.log(`Fetching ${skill.name}...`);
            await downloadFile(skill.url, path.join(targetDir, skill.name));
            console.log(`Successfully saved ${skill.name}`);
            successCount++;
        } catch (err) {
            console.error(`Error downloading ${skill.name}: ${err.message}`);
        }
    }
    console.log(`\nFinished! Successfully downloaded ${successCount}/${skillsToFetch.length} skills.`);
}

run();
