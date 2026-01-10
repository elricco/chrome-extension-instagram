#!/usr/bin/env python3
"""
Generate Instagram Reels Controls extension icons
with Instagram gradient, camera logo, and "IRC" text
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

def draw_camera_icon(draw, size, color='white'):
    """Draw simplified Instagram camera icon"""
    # Scale factors
    s = size / 128  # Base size is 128
    cx, cy = size / 2, size / 2  # Center

    # Outer rounded rectangle (camera body)
    padding = 20 * s
    outer_radius = 28 * s
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=outer_radius,
        outline=color,
        width=max(2, int(6 * s))
    )

    # Inner circle (lens)
    lens_radius = 22 * s
    draw.ellipse(
        [cx - lens_radius, cy - lens_radius, cx + lens_radius, cy + lens_radius],
        outline=color,
        width=max(2, int(6 * s))
    )

    # Small circle (flash) - top right
    flash_radius = 5 * s
    flash_x = size - padding - 18 * s
    flash_y = padding + 18 * s
    draw.ellipse(
        [flash_x - flash_radius, flash_y - flash_radius,
         flash_x + flash_radius, flash_y + flash_radius],
        fill=color
    )

def add_irc_text(img, size):
    """Add 'IRC' text to bottom-right corner"""
    draw = ImageDraw.Draw(img)

    # Calculate font size based on icon size
    font_size = max(8, int(size * 0.22))

    # Try to use a nice font, fallback to default
    try:
        # Try common macOS fonts
        font_paths = [
            '/System/Library/Fonts/SFCompact-Bold.otf',
            '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
            '/System/Library/Fonts/Helvetica.ttc',
            '/Library/Fonts/Arial Bold.ttf',
        ]
        font = None
        for path in font_paths:
            if os.path.exists(path):
                try:
                    font = ImageFont.truetype(path, font_size)
                    break
                except:
                    continue
        if font is None:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()

    text = "IRC"

    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Position in bottom-right with padding
    padding = max(2, int(size * 0.08))
    x = size - text_width - padding
    y = size - text_height - padding - 2

    # Draw text shadow for better visibility
    shadow_offset = max(1, int(size * 0.015))
    draw.text((x + shadow_offset, y + shadow_offset), text, fill=(0, 0, 0, 180), font=font)

    # Draw main text
    draw.text((x, y), text, fill='white', font=font)

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

    # Draw camera icon
    draw = ImageDraw.Draw(final)
    draw_camera_icon(draw, size, color='white')

    # Add IRC text
    if size >= 32:  # Only add text for larger icons
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
