# SBC Cast Hub - Enterprise Deployment Guide

This guide outlines the process for creating a "Golden Image" for your Single Board Computers (SBCs) to deploy the Cast Hub across Pamlico County Schools.

## Overview

We cannot directly generate a `.img` file from this web environment, but we have provided an automated provisioning script (`scripts/setup-kiosk.sh`) that transforms a base Linux OS into a dedicated, locked-down digital signage and casting receiver.

## Prerequisites

1. A base OS image flashed to an SD card or eMMC (e.g., **Raspberry Pi OS Lite** or **Ubuntu Server**).
2. SSH access to the device.
3. The device connected to the internet.

## Creating the Golden Image

### Step 1: Run the Provisioning Script

1. Copy the `scripts/setup-kiosk.sh` script to your SBC.
2. Make it executable:
   ```bash
   chmod +x setup-kiosk.sh
   ```
3. Run the script as root:
   ```bash
   sudo ./setup-kiosk.sh
   ```
   *This script will install X11, Chromium, Node.js, and configure the device to boot directly into a fullscreen, locked-down browser.*

### Step 2: Install the Next.js Application

1. Copy the contents of this repository to `/opt/sbc-cast-hub` on the device.
2. Install dependencies and build the application:
   ```bash
   cd /opt/sbc-cast-hub
   npm install
   npm run build
   ```

### Step 3: Configure Autostart for the Web Server

We use `pm2` to ensure the Next.js server starts automatically on boot and restarts if it crashes.

1. Start the application:
   ```bash
   pm2 start npm --name "cast-hub" -- start
   ```
2. Save the process list and configure it to start on boot:
   ```bash
   pm2 save
   pm2 startup
   ```
   *(Run the command that `pm2 startup` outputs to finalize the configuration).*

### Step 4: Configure the Casting Receivers

The script installs `uxplay` for AirPlay. You will need to configure it to start on boot as well.

1. Create a systemd service for `uxplay`:
   ```bash
   sudo nano /etc/systemd/system/uxplay.service
   ```
2. Add the following configuration (adjusting the `-n` parameter to dynamically pull the hostname if desired):
   ```ini
   [Unit]
   Description=UxPlay AirPlay Receiver
   After=network.target avahi-daemon.service

   [Service]
   ExecStart=/usr/bin/uxplay -n "Room %H Display" -p
   Restart=always
   User=kiosk

   [Install]
   WantedBy=multi-user.target
   ```
3. Enable and start the service:
   ```bash
   sudo systemctl enable uxplay
   sudo systemctl start uxplay
   ```

### Step 5: Finalize and Clone

1. Reboot the device (`sudo reboot`) to verify that it automatically starts the Next.js server, launches the casting receivers in the background, and opens Chromium in full-screen kiosk mode displaying the dashboard.
2. Once verified, shut down the device.
3. Remove the SD card/eMMC and use a tool like `dd` (Linux/Mac) or Win32DiskImager (Windows) to read the disk and save it as your `pamlico-cast-hub-golden.img`.
4. Use a mass-flashing tool (like Balena Etcher Pro or a multi-port SD duplicator) to flash this image to your 2000 devices.

## Device-Specific Configuration (Post-Flash)

Since all 2000 devices will have the same image, you will need a mechanism to assign unique hostnames and IP addresses. 

We recommend using a **DHCP reservation script** or a **first-boot script** that pulls the room number based on the device's MAC address from a central CSV file hosted on your IT servers, and updates `/etc/hostname` and the Next.js `.env` file accordingly.
