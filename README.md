# Browse Back - Chrome Extension

Browse Back is a Chrome extension designed to help you understand your Browse habits and take control of your digital life. It provides a weekly snapshot of your online activity, allowing you to reflect on where your time is spent and set goals to improve your focus.

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/cc6c02fd-05e0-43d3-9129-6a40ff574ff2" />
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/45bf5602-b499-4e23-aae7-a3bbd2681351" />
    </td>
  </tr>
</table>


## Features

- **Time Tracking:** Automatically tracks the time you spend on different websites.
- **Goal Setting:** Set daily time limits for specific websites and get notified when you exceed them.
- **Weekly History:** Review your Browse activity for the past 7 days.
- **Data Visualization:** A simple bar chart helps you visualize your time spent on various sites.
- **Ignore List:** Add domains to an "Ignore list" to exclude them from tracking.
- **Customizable Time Range:** View your Browse data for today, the last 3 days, 5 days, or 7 days.

## How It Works

The extension runs in the background, monitoring your active tab and recording the time spent on each domain. This data is stored locally in your browser.

- The **Popup** (when you click the extension icon) gives you a quick overview of your daily usage and allows you to set time-limit goals.
- The **Options Page** provides a more detailed view, including a history of your Browse, a bar chart for visualization, and a settings area to manage your allow list.

The application is built as a monorepo using `pnpm` and `Turborepo` for efficient development and code sharing between the different parts of the extension.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/installation) installed on your machine.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/wiscaksono/browse-back.git
    cd browse-back
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Build the extension:**

    ```bash
    pnpm build
    ```

4.  **Load the extension in Chrome:**
    - Open Chrome and navigate to `chrome://extensions`.
    - Enable "Developer mode" in the top right corner.
    - Click "Load unpacked."
    - Select the `/dist` directory from the project folder.

## Development

To run the extension in development mode with hot-reloading:

```bash
pnpm dev
```
