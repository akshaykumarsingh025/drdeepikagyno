#!/usr/bin/env python3
"""
Image Optimization Script for Dr. Deepika Gyno Website
This script optimizes images for web delivery.

Requirements:
    pip install Pillow

Usage:
    python scripts/optimize_images.py
"""

import os
from PIL import Image
from pathlib import Path

# Configuration
SOURCE_DIR = Path("Assests")
OUTPUT_DIR = Path("public/assets")

# Image optimization settings
IMAGE_SETTINGS = {
    "jpg": {"quality": 85, "optimize": True},
    "png": {"optimize": True},
    "webp": {"quality": 85, "method": 6},
}

# Max dimensions for different image types
MAX_DIMENSIONS = {
    "logo": (400, 400),
    "doctor": (800, 1000),
    "patient": (600, 800),
    "facility": (1200, 800),
    "favicon": (32, 32),
}


def ensure_output_dir():
    """Create output directory if it doesn't exist."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def optimize_image(input_path: Path, output_path: Path, max_size: tuple = None):
    """Optimize a single image."""
    try:
        with Image.open(input_path) as img:
            # Convert RGBA to RGB for JPEG
            if img.mode == "RGBA" and output_path.suffix.lower() in [".jpg", ".jpeg"]:
                # Create white background
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            
            # Resize if max_size is specified
            if max_size:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            if output_path.suffix.lower() == ".webp":
                img.save(output_path, "WEBP", quality=85, method=6)
            elif output_path.suffix.lower() in [".jpg", ".jpeg"]:
                img.save(output_path, "JPEG", quality=85, optimize=True)
            elif output_path.suffix.lower() == ".png":
                img.save(output_path, "PNG", optimize=True)
            else:
                img.save(output_path)
            
            print(f"✓ Optimized: {input_path.name} -> {output_path.name}")
            
    except Exception as e:
        print(f"✗ Error processing {input_path.name}: {e}")


def convert_to_webp(input_path: Path, output_path: Path, max_size: tuple = None):
    """Convert image to WebP format."""
    try:
        with Image.open(input_path) as img:
            if max_size:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            webp_path = output_path.with_suffix(".webp")
            img.save(webp_path, "WEBP", quality=85, method=6)
            print(f"✓ Converted to WebP: {input_path.name} -> {webp_path.name}")
            
    except Exception as e:
        print(f"✗ Error converting {input_path.name}: {e}")


def create_favicon(input_path: Path, output_dir: Path):
    """Create favicon.ico from logo."""
    try:
        with Image.open(input_path) as img:
            # Create multiple sizes for favicon
            sizes = [(16, 16), (32, 32), (48, 48)]
            images = []
            
            for size in sizes:
                temp = img.copy()
                temp.thumbnail(size, Image.Resampling.LANCZOS)
                images.append(temp)
            
            # Save as ICO
            favicon_path = output_dir / "favicon.ico"
            images[0].save(
                favicon_path,
                format="ICO",
                sizes=sizes,
                append_images=images[1:]
            )
            print(f"✓ Created favicon: {favicon_path}")
            
    except Exception as e:
        print(f"✗ Error creating favicon: {e}")


def main():
    """Main optimization process."""
    print("=" * 50)
    print("Image Optimization Script")
    print("=" * 50)
    
    ensure_output_dir()
    
    # Process logo
    logo_dir = SOURCE_DIR / "LogoAndFav"
    if logo_dir.exists():
        print("\n📁 Processing Logo & Favicon...")
        for file in logo_dir.iterdir():
            if file.suffix.lower() in [".png", ".jpg", ".jpeg", ".heic", ".dng"]:
                if "logo" in file.name.lower():
                    optimize_image(file, OUTPUT_DIR / "logo.png", MAX_DIMENSIONS["logo"])
                    convert_to_webp(file, OUTPUT_DIR / "logo.webp", MAX_DIMENSIONS["logo"])
                elif "fav" in file.name.lower():
                    optimize_image(file, OUTPUT_DIR / "favicon.png", MAX_DIMENSIONS["favicon"])
                    create_favicon(file, OUTPUT_DIR)
    
    # Process doctor photos
    doctor_dir = SOURCE_DIR / "DrdeepikaPics"
    if doctor_dir.exists():
        print("\n📁 Processing Doctor Photos...")
        for file in doctor_dir.iterdir():
            if file.suffix.lower() in [".png", ".jpg", ".jpeg", ".heic", ".dng"]:
                output_name = f"DrdeepikaPics_{file.stem}.jpg"
                optimize_image(file, OUTPUT_DIR / output_name, MAX_DIMENSIONS["doctor"])
    
    # Process patient photos
    patient_dir = SOURCE_DIR / "HappySatisfiedPatients"
    if patient_dir.exists():
        print("\n📁 Processing Patient Photos...")
        for file in patient_dir.iterdir():
            if file.suffix.lower() in [".png", ".jpg", ".jpeg", ".heic", ".dng"]:
                output_name = f"HappySatisfiedPatients_{file.stem}.jpg"
                optimize_image(file, OUTPUT_DIR / output_name, MAX_DIMENSIONS["patient"])
    
    # Process facility photos
    facility_dir = SOURCE_DIR / "Operationtheator"
    if facility_dir.exists():
        print("\n📁 Processing Facility Photos...")
        for file in facility_dir.iterdir():
            if file.suffix.lower() in [".png", ".jpg", ".jpeg", ".heic", ".dng"]:
                output_name = f"Operationtheator_{file.stem}.jpg"
                optimize_image(file, OUTPUT_DIR / output_name, MAX_DIMENSIONS["facility"])
    
    print("\n" + "=" * 50)
    print("✅ Image optimization complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
