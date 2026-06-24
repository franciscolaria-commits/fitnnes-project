from PIL import Image

try:
    img = Image.open('c:\\Users\\franc\\fitness-platform\\pwa\\public\\logo.png')
    img = img.convert("RGB")
    datas = img.getdata()

    # Get background color from top left pixel
    bg_pixel = datas[0] 
    
    print(f"Detected background color: {bg_pixel}")

    newData = []
    for item in datas:
        # Subtract background color, clamping to 0
        r = max(0, item[0] - bg_pixel[0])
        g = max(0, item[1] - bg_pixel[1])
        b = max(0, item[2] - bg_pixel[2])
        newData.append((r, g, b))

    img.putdata(newData)
    img.save('c:\\Users\\franc\\fitness-platform\\pwa\\public\\logo.png', "PNG")
    print("Logo background neutralized to pure black successfully.")
except Exception as e:
    print(f"Error processing image: {e}")
