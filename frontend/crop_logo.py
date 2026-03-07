from PIL import Image, ImageChops

def trim(im):
    im = im.convert("RGBA")
    alpha = im.getchannel('A')
    bbox = alpha.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

def trim_white(im):
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    diff = ImageChops.difference(im, bg)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

try:
    img = Image.open('public/LogoNewEdu.png')
    
    # First try cropping transparency
    cropped = trim(img)
    
    # Also try cropping white borders if transparency wasn't it
    if cropped.size == img.size:
        cropped = trim_white(cropped)
        
    # Resize to square with minor padding (2%)
    size = max(cropped.size)
    pad = int(size * 0.02)
    new_size = size + pad * 2
    
    square_img = Image.new('RGBA', (new_size, new_size), (255, 255, 255, 0))
    square_img.paste(cropped, (pad + (size - cropped.width)//2, pad + (size - cropped.height)//2))
    
    square_img.save('public/LogoNewEdu_cropped.png')
    print(f"Original shape: {img.size}. New shape: {square_img.size}")
except Exception as e:
    import traceback
    traceback.print_exc()
