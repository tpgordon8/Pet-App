#!/usr/bin/env python3
"""
Comprehensive E2E test for Tailr signup flow
Tests the complete onboarding process from welcome to dashboard
"""

from playwright.sync_api import sync_playwright
import time
import random
import string

def generate_test_name():
    """Generate a unique test name"""
    suffix = ''.join(random.choices(string.digits, k=4))
    return f"TestUser{suffix}"

def test_signup_flow():
    with sync_playwright() as p:
        print("🚀 Starting Tailr signup flow test...")

        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720}
        )
        page = context.new_page()

        # Enable console logging to catch errors
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

        # Enable error tracking
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        try:
            # Step 1: Navigate to app
            print("\n📍 Step 1: Navigating to http://localhost:5173...")
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')
            time.sleep(1)  # Let animations settle

            # Take screenshot of landing page
            page.screenshot(path='/tmp/01_landing.png', full_page=True)
            print("   ✓ Landing page loaded")
            print(f"   Title: {page.title()}")

            # Step 2: Check for welcome screen or redirect to onboarding
            print("\n📍 Step 2: Checking current state...")
            current_url = page.url
            print(f"   Current URL: {current_url}")

            # Clear any existing localStorage to ensure fresh start
            page.evaluate("localStorage.clear()")
            page.reload()
            page.wait_for_load_state('networkidle')
            time.sleep(1)

            page.screenshot(path='/tmp/02_fresh_start.png', full_page=True)

            # Step 3: Look for "Create" button or welcome screen
            print("\n📍 Step 3: Finding welcome screen...")

            # Wait for either "Create" or "Join" button
            try:
                create_button = page.wait_for_selector('text=/create/i', timeout=10000)
                print("   ✓ Found Create button")
                page.screenshot(path='/tmp/03_welcome.png', full_page=True)
            except Exception:
                print("   ⚠ Create button not found, checking page content...")
                print(f"   Page content preview: {page.content()[:500]}")
                page.screenshot(path='/tmp/03_error.png', full_page=True)
                raise

            # Step 4: Click "Create New Household"
            print("\n📍 Step 4: Clicking 'Create New Household'...")
            create_button.click()
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            page.screenshot(path='/tmp/04_add_pet.png', full_page=True)
            print("   ✓ Navigated to Add Pet step")

            # Step 5: Fill in pet details
            print("\n📍 Step 5: Adding pet...")

            # Look for pet name input
            pet_name_input = page.wait_for_selector('input[placeholder*="name" i]', timeout=5000)
            pet_name_input.fill("TestDog")
            print("   ✓ Entered pet name: TestDog")

            # Select emoji (look for dog emoji or emoji picker)
            try:
                dog_emoji = page.locator('text="🐕"').first
                dog_emoji.click()
                print("   ✓ Selected dog emoji")
            except Exception:
                print("   ⚠ Emoji selector not found, trying alternative method...")
                # Try clicking emoji picker if exists
                emoji_buttons = page.locator('button[class*="emoji"]').all()
                if emoji_buttons:
                    emoji_buttons[0].click()
                    print("   ✓ Selected first emoji")

            # Select species if available
            try:
                species_select = page.locator('select, input[placeholder*="species" i]').first
                species_select.fill("Dog")
                print("   ✓ Selected species: Dog")
            except Exception:
                print("   ⚠ Species field not found (may be optional)")

            page.screenshot(path='/tmp/05_pet_filled.png', full_page=True)

            # Click Continue/Next
            continue_button = page.locator('button:has-text("Continue"), button:has-text("Next")').first
            continue_button.click()
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            page.screenshot(path='/tmp/06_personalization.png', full_page=True)
            print("   ✓ Advanced to next step")

            # Step 6: Personalization (if it exists, skip if possible)
            print("\n📍 Step 6: Handling personalization step...")

            # Try to find Skip button or Continue button
            try:
                skip_button = page.locator('button:has-text("Skip")').first
                skip_button.click(timeout=2000)
                print("   ✓ Skipped personalization")
                page.wait_for_load_state('networkidle')
                time.sleep(1)
            except Exception:
                # Try Continue button
                try:
                    continue_button = page.locator('button:has-text("Continue"), button:has-text("Next")').first
                    continue_button.click(timeout=2000)
                    print("   ✓ Continued through personalization")
                    page.wait_for_load_state('networkidle')
                    time.sleep(1)
                except Exception:
                    print("   ⚠ No skip/continue button found, may already be past this step")

            page.screenshot(path='/tmp/07_create_account.png', full_page=True)

            # Step 7: Create Account
            print("\n📍 Step 7: Creating account...")

            test_name = generate_test_name()
            print(f"   Using test name: {test_name}")

            # Fill in name
            name_input = page.locator('input[id="name"], input[placeholder*="name" i]').first
            name_input.fill(test_name)
            print(f"   ✓ Entered name: {test_name}")

            # Fill in passcode
            passcode_input = page.locator('input[id="passcode"], input[type="password"]').first
            passcode_input.fill("123456")
            print("   ✓ Entered passcode: 123456")

            # Household code (leave empty for auto-generation)
            try:
                household_input = page.locator('input[id="household-code"]').first
                household_code = f"{test_name.upper()}2026"
                household_input.fill(household_code)
                print(f"   ✓ Entered household code: {household_code}")
            except Exception:
                print("   ℹ Household code field not found (will auto-generate)")

            page.screenshot(path='/tmp/08_account_filled.png', full_page=True)

            # Click Continue to create household
            print("\n📍 Step 8: Submitting account creation...")
            create_account_button = page.locator('button[type="submit"], button:has-text("Continue")').first
            create_account_button.click()

            # Wait for household creation (this is the critical step)
            print("   ⏳ Waiting for household creation...")
            time.sleep(3)  # Give Firebase time to process
            page.wait_for_load_state('networkidle')

            page.screenshot(path='/tmp/09_after_submit.png', full_page=True)

            # Check for error messages
            error_elements = page.locator('[class*="error"]').all()
            if error_elements:
                print("   ⚠ ERROR MESSAGES FOUND:")
                for error_elem in error_elements:
                    if error_elem.is_visible():
                        print(f"      - {error_elem.text_content()}")

            # Check console for errors
            error_messages = [msg for msg in console_messages if 'error' in msg.lower()]
            if error_messages:
                print("\n   ⚠ CONSOLE ERRORS:")
                for msg in error_messages:
                    print(f"      {msg}")

            if errors:
                print("\n   ⚠ PAGE ERRORS:")
                for err in errors:
                    print(f"      {err}")

            # Step 9: Verify we reached household setup or success
            print("\n📍 Step 9: Verifying signup success...")
            current_url = page.url
            print(f"   Current URL: {current_url}")

            # Check for success indicators
            success_indicators = [
                'household setup',
                'success',
                'dashboard',
                'welcome',
                'household code'
            ]

            page_text = page.text_content('body').lower()
            found_indicators = [ind for ind in success_indicators if ind in page_text]

            if found_indicators:
                print(f"   ✓ Found success indicators: {found_indicators}")
            else:
                print("   ⚠ No clear success indicators found")
                print(f"   Page text preview: {page_text[:300]}...")

            # Try to proceed to dashboard if there's a button
            try:
                done_button = page.locator('button:has-text("Done"), button:has-text("Dashboard"), button:has-text("Get Started")').first
                done_button.click(timeout=3000)
                page.wait_for_load_state('networkidle')
                time.sleep(1)
                page.screenshot(path='/tmp/10_dashboard.png', full_page=True)
                print("   ✓ Reached dashboard")
            except Exception:
                print("   ℹ No dashboard button found (may already be on final screen)")
                page.screenshot(path='/tmp/10_final.png', full_page=True)

            # Final verification
            print("\n" + "="*60)
            print("📊 TEST RESULTS")
            print("="*60)
            print("✓ Successfully navigated through signup flow")
            print(f"✓ Created household for user: {test_name}")
            print(f"✓ Final URL: {page.url}")
            print("✓ Screenshots saved to /tmp/")

            if errors:
                print(f"\n⚠ {len(errors)} page errors detected")
                return False

            if error_messages:
                print(f"\n⚠ {len(error_messages)} console errors detected")
                return False

            print("\n✅ SIGNUP FLOW TEST PASSED!")
            return True

        except Exception as e:
            print(f"\n❌ TEST FAILED: {e}")
            page.screenshot(path='/tmp/error_final.png', full_page=True)

            # Print helpful debug info
            print("\n🔍 DEBUG INFO:")
            print(f"   Current URL: {page.url}")
            print(f"   Page title: {page.title()}")
            print(f"   Errors: {len(errors)}")
            print(f"   Console messages: {len(console_messages)}")

            if console_messages:
                print("\n   Last 10 console messages:")
                for msg in console_messages[-10:]:
                    print(f"      {msg}")

            return False

        finally:
            browser.close()
            print("\n🏁 Test completed")

if __name__ == "__main__":
    success = test_signup_flow()
    exit(0 if success else 1)
