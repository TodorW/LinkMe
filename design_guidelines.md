# LinkMe Design Guidelines

## Brand Identity
**Purpose**: Community micro-solidarity app connecting local neighbors who need help with willing volunteers.

**Aesthetic Direction**: **Warm & Trustworthy Community** - Approachable, human-centered design that feels safe and welcoming. Not clinical or corporate. Think neighborhood bulletin board meets modern tech.

**Memorable Element**: Role-based UI transformation - the entire app shifts personality based on whether you're seeking help or offering it. Same map, different lens.

**Platform**: Android-first using Material 3 guidelines.

---

## Navigation Architecture

**Root Navigation**: Tab Navigation (3 tabs) with role-aware content

**Tabs**:
1. **Map** (Home) - Interactive help radar, adapts to user role
2. **Messages** - In-app chat conversations
3. **Profile** - User settings, role switcher, reputation

**Auth Flow**: Email authentication via Firebase (linear stack before main app)

---

## Screen Specifications

### Auth Screens (Stack-Only)

**Welcome Screen**
- Purpose: App introduction and value proposition
- Layout: Full-screen with illustration, scrollable content
- Components: Hero illustration (people helping each other), app tagline, two CTA buttons (Sign Up, Log In)
- Safe Area: top inset.top + 24px, bottom inset.bottom + 24px

**Registration Screen**
- Purpose: Create account with JMBG verification
- Layout: Scrollable form with header
- Header: Back button (left), title "Register"
- Form Fields: Email, Password, Name/Nickname, JMBG (with info icon explaining privacy), Role selector (User/Volunteer radio buttons)
- If Volunteer selected: Show multi-select chips for help categories (Shopping, Cleaning, Tools, Transport, Tech Help, Other)
- Submit button: Fixed at bottom (primary color)
- Safe Area: top headerHeight + 16px, bottom inset.bottom + 16px

**Login Screen**
- Layout: Centered card form
- Components: Email field, Password field, Login button, "Forgot password?" link
- Safe Area: symmetric 24px

---

### Main App (Tab Navigation)

**Map Screen (Tab 1 - Home)**
- Purpose: Visual help radar, role-adaptive UI
- Layout: Full-screen map with overlays
- Header: Transparent with role badge (chip showing "Seeking Help" or "Volunteering"), filter button (right)
- Map: Google Maps with custom markers (users needing help = red pin, volunteers = blue pin)
- Floating Elements:
  - FOR USERS SEEKING HELP: Two prominent FABs stacked vertically bottom-right:
    - Primary FAB: "Request Help" (larger, primary color)
    - Secondary FAB: "My Requests" (smaller, surface color with border)
  - FOR VOLUNTEERS: Single filter drawer toggle (bottom sheet) showing category filters and distance slider
- Empty State: If no active requests nearby, show centered card with illustration and "No active requests in your area"
- Safe Area: bottom inset.bottom + 88px (FABs + spacing), top headerHeight + 16px

**Request Help Screen (Modal)**
- Purpose: Create help request
- Layout: Bottom sheet modal (80% screen height)
- Header: "Request Help" title, close X (right)
- Form: Help category dropdown, description text area, location (auto-filled, editable), urgency toggle (Urgent/Flexible)
- Submit: Fixed button at bottom "Post Request"
- Safe Area: bottom inset.bottom + 16px

**Help Detail Screen (Modal)**
- Purpose: View request details, accept to help (volunteers), view status (users)
- Layout: Full-screen modal with image header
- Header: Back button, share button (right)
- Content: Profile avatar, name, category badge, description, distance, timestamp, AI match score (for volunteers)
- Actions:
  - Volunteers: "Offer Help" button (primary)
  - Users: Status indicator, "Cancel Request" (destructive text button)
- Safe Area: standard screen padding

**Messages Screen (Tab 2)**
- Purpose: Chat list and conversations
- Layout: List view with search bar in header
- Header: "Messages" title, search icon (right)
- List Items: Avatar, name, last message preview, timestamp, unread badge
- Empty State: Illustration with "No conversations yet"
- Safe Area: top headerHeight, bottom tabBarHeight + 16px

**Chat Screen (Stack)**
- Purpose: One-on-one messaging
- Layout: Message list with input bar
- Header: Back button, user name/avatar, more menu (right)
- Messages: Bubbles (sent = primary color right-aligned, received = surface left-aligned)
- Input: Text field with send icon button (fixed bottom)
- Safe Area: bottom inset.bottom

**Profile Screen (Tab 3)**
- Purpose: User settings, role management, reputation
- Layout: Scrollable list with header card
- Header Card: Avatar (large), name, role badge, reputation stars
- Sections:
  - Role Switcher: Toggle between "Seeking Help" / "Volunteering"
  - Help Categories (if volunteer): Editable chips
  - Activity: Stats (requests completed, hours contributed)
  - Settings: Notifications, Location permissions, Privacy policy
  - Account: Log out (destructive)
- Safe Area: top headerHeight, bottom tabBarHeight + 16px

**Rating Screen (Modal)**
- Purpose: Rate completed help interaction
- Layout: Centered card modal
- Components: Star rating (1-5), optional comment text area, submit button
- Safe Area: standard modal padding

---

## Color Palette

**Primary**: #FF6B35 (Warm Orange) - Energetic, helpful, community-focused
**Primary Variant**: #E85A28
**Secondary**: #4ECDC4 (Teal) - Trust, calm, connection
**Background**: #FAFAFA
**Surface**: #FFFFFF
**Error**: #D32F2F
**Success**: #43A047

**Text**:
- Primary: #212121
- Secondary: #757575
- Disabled: #BDBDBD
- On Primary: #FFFFFF

**Role Indicators**:
- Seeking Help: #FF6B35 (Primary)
- Volunteering: #4ECDC4 (Secondary)

---

## Typography

**Font**: Nunito (Google Font - friendly, approachable)

**Type Scale**:
- H1: 28px, Bold (screen titles)
- H2: 24px, Bold (section headers)
- H3: 20px, SemiBold (card titles)
- Body: 16px, Regular
- Caption: 14px, Regular (timestamps, metadata)
- Button: 16px, SemiBold

---

## Visual Design

- Use Feather icons from Flutter's icon library
- Map markers: Custom colored pins (red for help requests, teal for volunteers)
- All buttons have 8px border radius
- Cards have 12px border radius with subtle elevation (2dp)
- FABs use primary color with 56px diameter (standard Material)
- Role badges: Pill-shaped chips with role color background and white text
- Form inputs: Outlined style with 8px border radius
- Touchable feedback: Material ripple effect

---

## Assets to Generate

**App Icon** (icon.png) - Orange helping hand symbol
- WHERE USED: Device home screen, app launcher

**Splash Icon** (splash-icon.png) - LinkMe logo wordmark
- WHERE USED: App launch screen

**Welcome Hero** (welcome-illustration.png) - Two people helping each other with groceries, warm colors
- WHERE USED: Welcome screen top section

**Empty Map State** (empty-map.png) - Simple illustration of map with location pin and "no results" indicator
- WHERE USED: Map screen when no requests nearby

**Empty Messages** (empty-messages.png) - Chat bubble icon with friendly character
- WHERE USED: Messages tab when no conversations

**Empty Requests** (empty-requests.png) - Calendar with checkmark (simple, minimal)
- WHERE USED: "My Requests" view when user has no active requests

**Default Avatar** (default-avatar.png) - Neutral person silhouette in circular frame, gray
- WHERE USED: User profiles without uploaded photo

**Category Icons** (8 total):
- shopping.png, cleaning.png, tools.png, transport.png, tech.png, other.png
- WHERE USED: Help category selectors, request cards, filter UI