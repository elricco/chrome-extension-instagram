#!/usr/bin/env python3
"""
Generate Instagram Reels Controls extension icons
with gradient background and "IRC" text
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os

def create_instagram_gradient(size):
    """Create Instagram-style gradient (purple -> pink -> orange -> yellow)"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    # Instagram gradient colors (bottom-left to top-right diagonal)
    # Purple -> Magenta -> Orange -> Yellow
    colors = [
        (129, 52, 175),   # Purple (#8134AF)
        (193, 53, 132),   # Magenta (#C13584)
        (225, 48, 108),   # Pink (#E1306C)
        (253, 29, 29),    # Red (#FD1D1D)
        (252, 175, 69),   # Orange (#FCAF45)
        (255, 220, 128),  # Yellow (#FFDC80)
    ]

    for y in range(size):
        for x in range(size):
            # Diagonal gradient from bottom-left to top-right
            t = (x + (size - y)) / (2 * size)
            t = max(0, min(1, t))

            # Find which color segment we're in
            segment = t * (len(colors) - 1)
            idx = int(segment)
            if idx >= len(colors) - 1:
                idx = len(colors) - 2
            frac = segment - idx

            # Interpolate between colors
            c1, c2 = colors[idx], colors[idx + 1]
            r = int(c1[0] + (c2[0] - c1[0]) * frac)
            g = int(c1[1] + (c2[1] - c1[1]) * frac)
            b = int(c1[2] + (c2[2] - c1[2]) * frac)

            img.putpixel((x, y), (r, g, b, 255))

    return img

def create_rounded_rect_mask(size, radius):
    """Create a rounded rectangle mask"""
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=255)
    return mask

def add_irc_text(img, size):
    """Add 'IRC' text centered on the icon"""
    draw = ImageDraw.Draw(img)

    # Calculate font size based on icon size
    font_size = int(size * 0.4)  # Larger font for centered text

    # Try to use a nice font, fallback to default
    try:
        # Try common macOS/system fonts
        font_paths = [
            '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
            '/System/Library/Fonts/SFNS.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/TTF/arial.ttf',
        ]
        font = None
        for path in font_paths:
            if os.path.exists(path):
                font = ImageFont.truetype(path, font_size)
                break
        if font is None:
            font = ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()

    text = 'IRC'

    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]  # Adjust for baseline

    # Add text shadow for better readability
    shadow_offset = max(1, int(size * 0.02))
    draw.text((x + shadow_offset, y + shadow_offset), text, fill=(0, 0, 0, 128), font=font)

    # Draw main text
    draw.text((x, y), text, fill='white', font=font, stroke_width=max(1, int(size * 0.015)), stroke_fill=(0, 0, 0, 100))

    return img

def add_white_outline(img, size, corner_radius):
    """Add white outline around the rounded rectangle"""
    draw = ImageDraw.Draw(img)

    # Calculate outline width based on size
    outline_width = max(2, int(size * 0.04))

    # Draw white rounded rectangle outline
    draw.rounded_rectangle(
        [0, 0, size-1, size-1],
        radius=corner_radius,
        outline='white',
        width=outline_width
    )

    return img

def create_icon(size):
    """Create a complete icon at the specified size"""
    # Create gradient background
    img = create_instagram_gradient(size)

    # Apply rounded corners
    corner_radius = int(size * 0.22)  # ~22% radius like Instagram
    mask = create_rounded_rect_mask(size, corner_radius)

    # Create final image with transparency
    final = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    final.paste(img, mask=mask)

    # Add white outline
    add_white_outline(final, size, corner_radius)

    # Add IRC text centered
    add_irc_text(final, size)

    return final

def main():
    """Generate all icon sizes"""
    icons_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(icons_dir, 'icons')

    # Ensure icons directory exists
    os.makedirs(icons_dir, exist_ok=True)

    sizes = [16, 48, 128]

    for size in sizes:
        icon = create_icon(size)
        filename = os.path.join(icons_dir, f'icon{size}.png')
        icon.save(filename, 'PNG')
        print(f'Created {filename}')

    print('\nAll icons generated successfully!')

if __name__ == '__main__':
    main()
