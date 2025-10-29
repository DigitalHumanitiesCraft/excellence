#!/usr/bin/env python3
"""
Import presentations from GM-DH repository to excellence site.

This script:
- Fetches presentations from https://github.com/chpollin/GM-DH
- Detects duplicates by comparing URLs
- Prompts for categorization (ai-research, ai-business, blog)
- Downloads images from GM-DH to local assets/
- Inserts new cards into index.html
- Handles missing data with interactive prompts
"""

import re
import sys
import os
import shutil
from pathlib import Path
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup


# Configuration
GM_DH_HTML_URL = "https://raw.githubusercontent.com/chpollin/GM-DH/refs/heads/main/index.html"
GM_DH_IMAGE_BASE = "https://chpollin.github.io/GM-DH/img/"
EXCELLENCE_INDEX = "index.html"
IMAGE_TARGET_DIR = "assets/img/work-gallery"
BACKUP_SUFFIX = ".backup"

# Categories
CATEGORIES = {
    "1": "ai-research",
    "2": "ai-business",
    "3": "blog",
    "4": "skip"
}


class PresentationCard:
    """Represents a presentation card from GM-DH."""

    def __init__(self, href, title, subtitle, img_filename, img_alt):
        self.href = href
        self.title = title
        self.subtitle = subtitle
        self.img_filename = img_filename
        self.img_alt = img_alt
        self.category = None

    def __repr__(self):
        return f"PresentationCard(title={self.title[:50]}..., href={self.href})"


def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)


def print_section(text):
    """Print a section divider."""
    print("\n" + "─" * 60)
    print(text)
    print("─" * 60)


def fetch_gm_dh_html():
    """Fetch the GM-DH HTML from GitHub."""
    print("🔍 Fetching presentations from GM-DH...")
    try:
        response = requests.get(GM_DH_HTML_URL, timeout=30)
        response.raise_for_status()
        print("✓ Successfully fetched GM-DH HTML")
        return response.text
    except requests.RequestException as e:
        print(f"✗ Error fetching GM-DH HTML: {e}")
        sys.exit(1)


def parse_gm_dh_presentations(html):
    """Parse presentation cards from GM-DH HTML."""
    soup = BeautifulSoup(html, 'html.parser')

    # Find the #vortraege section
    vortraege_section = soup.find('section', id='vortraege')
    if not vortraege_section:
        print("✗ Could not find #vortraege section in GM-DH HTML")
        return []

    cards = []
    card_containers = vortraege_section.find_all('div', class_='col-sm-4')

    for container in card_containers:
        # Check if card has a link
        link = container.find('a', class_='card-link')
        if not link:
            # Skip cards without links (non-clickable)
            title_elem = container.find('h5', class_='card-title')
            if title_elem:
                title = title_elem.get_text(strip=True)
                print(f"⚠️  Skipping non-clickable card: {title[:50]}...")
            continue

        href = link.get('href', '').strip()
        if not href:
            continue

        # Extract card body elements
        card_body = container.find('div', class_='card-body')
        if not card_body:
            continue

        title_elem = card_body.find('h5', class_='card-title')
        if not title_elem:
            continue
        title = title_elem.get_text(strip=True)

        # Subtitle/event info (may be missing)
        subtitle_elem = card_body.find('p', class_='card-text')
        subtitle = subtitle_elem.get_text(strip=True) if subtitle_elem else None

        # Image info
        img = container.find('img', class_='card-img-top')
        if img:
            img_src = img.get('src', '')
            img_filename = img_src.split('/')[-1] if img_src else ''
            img_alt = img.get('alt', img_filename.replace('.png', '').replace('.jpg', ''))
        else:
            img_filename = ''
            img_alt = ''

        card = PresentationCard(href, title, subtitle, img_filename, img_alt)
        cards.append(card)

    print(f"✓ Found {len(cards)} cards in GM-DH #vortraege section")
    return cards


def get_existing_hrefs(html):
    """Extract existing hrefs from excellence/index.html."""
    soup = BeautifulSoup(html, 'html.parser')

    # Find the shuffle container
    shuffle_container = soup.find('div', class_='js-shuffle')
    if not shuffle_container:
        print("⚠️  Could not find js-shuffle container in excellence HTML")
        return set()

    hrefs = set()
    for link in shuffle_container.find_all('a', class_='card'):
        href = link.get('href', '').strip()
        if href:
            hrefs.add(href)

    return hrefs


def detect_duplicates(cards, existing_hrefs):
    """Filter out cards that already exist in excellence."""
    new_cards = []
    duplicates = []

    for card in cards:
        if card.href in existing_hrefs:
            duplicates.append(card)
        else:
            new_cards.append(card)

    return new_cards, duplicates


def handle_missing_subtitle(card):
    """Handle cards with missing subtitle/event info."""
    print(f"\n⚠️  This card has no event/date information.")
    print(f"Title: {card.title[:80]}...")

    print("\nOptions:")
    print("[1] Enter manually (e.g., 'Workshop. Salzburg. 15.01.2025.')")
    print("[2] Use placeholder 'Event info TBD'")
    print("[3] Skip this card")

    while True:
        choice = input("\nYour choice: ").strip()
        if choice == "1":
            subtitle = input("Enter event/date info: ").strip()
            if subtitle:
                card.subtitle = subtitle
                return True
            print("⚠️  Empty input, please try again")
        elif choice == "2":
            card.subtitle = "Event info TBD"
            return True
        elif choice == "3":
            return False
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")


def check_date_format(subtitle):
    """Check if subtitle contains DD.MM.YYYY date format."""
    if not subtitle:
        return False
    return bool(re.search(r'\d{2}\.\d{2}\.\d{4}', subtitle))


def prompt_for_category(card, card_num, total_cards):
    """Prompt user to categorize a presentation."""
    print_section(f"📄 NEW CARD #{card_num} of {total_cards}")

    print(f"\nTitle: {card.title}")
    print(f"Event: {card.subtitle if card.subtitle else '⚠️  MISSING'}")
    print(f"Image: {card.img_filename}")
    print(f"Link: {card.href[:60]}...")

    # Handle missing subtitle
    if not card.subtitle:
        if not handle_missing_subtitle(card):
            return "skip"

    # Check for date format
    if card.subtitle and not check_date_format(card.subtitle):
        print(f"\n⚠️  No date in DD.MM.YYYY format found - will sort to bottom (1970)")
        add_date = input("Add date to subtitle? [y/n]: ").strip().lower()
        if add_date == 'y':
            date = input("Enter date (DD.MM.YYYY): ").strip()
            if re.match(r'\d{2}\.\d{2}\.\d{4}', date):
                card.subtitle = f"{card.subtitle}. {date}."
            else:
                print("⚠️  Invalid date format, continuing without date")

    print(f"\n✓ Event info: {card.subtitle}")
    print("\nSelect category:")
    print("[1] ai-research (academic presentations)")
    print("[2] ai-business (business/training)")
    print("[3] blog (blog posts)")
    print("[4] Skip this card")

    while True:
        choice = input("\nYour choice: ").strip()
        if choice in CATEGORIES:
            category = CATEGORIES[choice]
            if category != "skip":
                print(f"✓ Category: {category}")
            return category
        else:
            print("Invalid choice. Please enter 1, 2, 3, or 4.")


def download_image(filename):
    """Download image from GM-DH to local assets directory."""
    if not filename:
        print("⚠️  No image filename provided")
        return False

    url = GM_DH_IMAGE_BASE + filename
    target_path = Path(IMAGE_TARGET_DIR) / filename

    # Check if image already exists
    if target_path.exists():
        overwrite = input(f"⚠️  Image {filename} already exists. Overwrite? [y/n]: ").strip().lower()
        if overwrite != 'y':
            print(f"✓ Using existing image: {filename}")
            return True

    # Create directory if it doesn't exist
    target_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"⬇️  Downloading image: {filename}")
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        with open(target_path, 'wb') as f:
            f.write(response.content)

        print(f"✓ Image saved to: {target_path}")
        return True
    except requests.RequestException as e:
        print(f"✗ Failed to download image: {e}")
        return False


def generate_card_html(card):
    """Generate HTML for a presentation card in excellence format."""
    # Escape special characters in HTML
    title_escaped = card.title.replace('"', '&quot;')
    subtitle_escaped = card.subtitle.replace('"', '&quot;') if card.subtitle else ''

    html = f'''
<div class="col js-shuffle-item mb-5" data-groups='["{card.category}"]'>
  <a
    class="card card-transition text-decoration-none"
    href="{card.href}"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      alt="{card.img_alt}"
      class="card-img-top"
      src="/{IMAGE_TARGET_DIR}/{card.img_filename}"
    />
    <div class="card-body">
      <h3 class="card-title">
        {card.title}
      </h3>
      <span class="card-subtitle text-body">
        {card.subtitle}
      </span>
    </div>
  </a>
</div>'''

    return html


def insert_card_into_html(html_content, card_html):
    """Insert a card into the excellence index.html shuffle container."""
    # Find the closing tag of the js-shuffle container
    # We need to find the </div> that comes right before <!-- End Row -->
    # Structure is:
    #   <div class="js-shuffle">
    #     ... cards ...
    #   </div>
    #   <!-- End Row -->

    # Find the comment first
    comment_match = re.search(r'<!-- End Row -->', html_content)
    if not comment_match:
        print("⚠️  Could not find <!-- End Row --> comment")
        return html_content

    # Now find the shuffle container opening
    shuffle_match = re.search(r'<div class="js-shuffle row[^>]*>', html_content)
    if not shuffle_match:
        print("⚠️  Could not find js-shuffle container opening")
        return html_content

    # Find the </div> that comes right before the comment
    # Search backwards from the comment position
    search_area = html_content[shuffle_match.end():comment_match.start()]
    last_closing_div = search_area.rfind('</div>')

    if last_closing_div == -1:
        print("⚠️  Could not find closing </div> before <!-- End Row -->")
        return html_content

    # Calculate the actual position in the full HTML
    insertion_point = shuffle_match.end() + last_closing_div

    # Insert the new card before the closing </div>
    new_html = html_content[:insertion_point] + "\n" + card_html + "\n" + html_content[insertion_point:]

    return new_html


def create_backup(filepath):
    """Create a backup of the file."""
    backup_path = filepath + BACKUP_SUFFIX
    shutil.copy2(filepath, backup_path)
    print(f"✓ Created backup: {backup_path}")


def main():
    """Main import workflow."""
    print_header("GM-DH to Excellence Presentation Import")

    # Check if index.html exists
    if not Path(EXCELLENCE_INDEX).exists():
        print(f"✗ Error: {EXCELLENCE_INDEX} not found in current directory")
        sys.exit(1)

    # Fetch and parse GM-DH
    gm_dh_html = fetch_gm_dh_html()
    gm_dh_cards = parse_gm_dh_presentations(gm_dh_html)

    if not gm_dh_cards:
        print("✗ No cards found in GM-DH")
        sys.exit(1)

    # Parse excellence HTML
    print("\n🔍 Parsing excellence index.html...")
    with open(EXCELLENCE_INDEX, 'r', encoding='utf-8') as f:
        excellence_html = f.read()

    existing_hrefs = get_existing_hrefs(excellence_html)
    print(f"✓ Found {len(existing_hrefs)} existing cards in excellence")

    # Detect duplicates
    new_cards, duplicates = detect_duplicates(gm_dh_cards, existing_hrefs)

    print_section("📊 Analysis")
    print(f"Total in GM-DH: {len(gm_dh_cards)}")
    print(f"Duplicates (skip): {len(duplicates)}")
    print(f"New cards: {len(new_cards)}")

    if not new_cards:
        print("\n✓ No new cards to import. All cards already exist in excellence!")
        return

    # Create backup
    print("\n💾 Creating backup...")
    create_backup(EXCELLENCE_INDEX)

    # Process each new card
    imported_cards = []
    skipped_cards = []
    manual_fixes = []
    failed_images = []

    for i, card in enumerate(new_cards, 1):
        category = prompt_for_category(card, i, len(new_cards))

        if category == "skip":
            print("⊗ Skipping this card\n")
            skipped_cards.append(card)
            continue

        card.category = category

        # Track if manual fixes were needed
        if not card.subtitle or not check_date_format(card.subtitle):
            manual_fixes.append(card)

        # Download image
        if card.img_filename:
            image_success = download_image(card.img_filename)
            if not image_success:
                failed_images.append(card.img_filename)

        # Generate and insert HTML
        card_html = generate_card_html(card)
        excellence_html = insert_card_into_html(excellence_html, card_html)

        print("✓ Card inserted into index.html\n")
        imported_cards.append(card)

    # Save modified HTML
    if imported_cards:
        print_section("💾 Saving Changes")
        with open(EXCELLENCE_INDEX, 'w', encoding='utf-8') as f:
            f.write(excellence_html)
        print(f"✓ Saved {EXCELLENCE_INDEX}")

    # Print summary
    print_header("✅ IMPORT COMPLETE!")
    print(f"\nSummary:")
    print(f"- Total in GM-DH: {len(gm_dh_cards)}")
    print(f"- Duplicates skipped: {len(duplicates)}")
    print(f"- New cards found: {len(new_cards)}")
    print(f"\nImport results:")
    print(f"✓ Imported: {len(imported_cards)} cards")
    if manual_fixes:
        print(f"⚠️  Manual fixes: {len(manual_fixes)} cards (missing/incomplete dates)")
    if skipped_cards:
        print(f"⊗ Skipped: {len(skipped_cards)} cards")

    print(f"\nImages:")
    print(f"✓ Downloaded: {len(imported_cards) - len(failed_images)} images")
    if failed_images:
        print(f"⚠️  Failed: {len(failed_images)} images")
        for img in failed_images:
            print(f"   - {img}")

    if imported_cards:
        print(f"\n📝 Modified files:")
        print(f"   - {EXCELLENCE_INDEX} ({len(imported_cards)} new cards added)")
        print(f"   - {IMAGE_TARGET_DIR}/ ({len(imported_cards) - len(failed_images)} new images)")
        print(f"\n⚠️  NEXT STEPS:")
        print(f"1. Review the changes in {EXCELLENCE_INDEX}")
        print(f"2. Test the page locally: open {EXCELLENCE_INDEX} in browser")
        print(f"3. Commit changes:")
        print(f"   git add {EXCELLENCE_INDEX} {IMAGE_TARGET_DIR}/")
        print(f"   git commit -m 'Import presentations from GM-DH'")
        print(f"   git push")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⊗ Import cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
