#!/bin/bash

# ==============================================================================
# SBC Cast Hub - Raspberry Pi 3B+ Image Builder
# 
# This script downloads a base Raspberry Pi OS Lite image, mounts it,
# injects the SBC Cast Hub application code, and sets up a first-boot
# service to automatically provision the device on its first startup.
#
# Requirements: Linux host (Debian/Ubuntu), root privileges, wget, xz-utils, rsync.
# ==============================================================================

set -e

# Ensure /sbin and /usr/sbin are in PATH (often missing when using sudo on Debian)
export PATH=$PATH:/sbin:/usr/sbin

if ! command -v losetup &> /dev/null; then
  echo "Error: losetup command not found. Please install the 'util-linux' package."
  exit 1
fi

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# Configuration
# Using Raspberry Pi OS Lite 64-bit (Compatible with 3B+)
IMAGE_URL="https://downloads.raspberrypi.com/raspios_lite_arm64/images/raspios_lite_arm64-2024-03-15/2024-03-15-raspios-bookworm-arm64-lite.img.xz"
IMAGE_XZ="raspios-lite.img.xz"
IMAGE_IMG="raspios-lite.img"
CUSTOM_IMG="sbc-cast-hub-rpi3bplus.img"
MOUNT_DIR="/tmp/rpi-mount"
APP_SRC_DIR="$(dirname "$0")/.."

echo "1. Downloading base Raspberry Pi OS Lite image..."
if [ ! -f "$IMAGE_XZ" ] && [ ! -f "$IMAGE_IMG" ]; then
    wget -O "$IMAGE_XZ" "$IMAGE_URL"
fi

echo "2. Extracting image (this may take a moment)..."
if [ ! -f "$IMAGE_IMG" ]; then
    unxz -k "$IMAGE_XZ"
fi

echo "3. Creating a copy for customization..."
cp "$IMAGE_IMG" "$CUSTOM_IMG"

echo "4. Mounting image partitions..."
# Find first available loop device and set up partitions
LOOP_DEV=$(losetup -f -P --show "$CUSTOM_IMG")
mkdir -p "${MOUNT_DIR}/boot"
mkdir -p "${MOUNT_DIR}/rootfs"

# Mount boot (partition 1) and rootfs (partition 2)
mount "${LOOP_DEV}p1" "${MOUNT_DIR}/boot"
mount "${LOOP_DEV}p2" "${MOUNT_DIR}/rootfs"

echo "5. Injecting SBC Cast Hub application and setup scripts..."
mkdir -p "${MOUNT_DIR}/rootfs/opt/sbc-cast-hub"

# Copy application files (excluding node_modules and .next)
echo "Copying app files from $APP_SRC_DIR..."
rsync -a --exclude 'node_modules' --exclude '.next' --exclude '.git' "$APP_SRC_DIR/" "${MOUNT_DIR}/rootfs/opt/sbc-cast-hub/"

# Ensure setup script is executable
chmod +x "${MOUNT_DIR}/rootfs/opt/sbc-cast-hub/scripts/setup-kiosk.sh"

echo "6. Configuring first-boot provisioning service..."
cat << 'EOF' > "${MOUNT_DIR}/rootfs/etc/systemd/system/sbc-provision.service"
[Unit]
Description=SBC Cast Hub First Boot Provisioning
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/bin/bash -c '/opt/sbc-cast-hub/scripts/setup-kiosk.sh > /var/log/sbc-provision.log 2>&1 && systemctl disable sbc-provision.service'
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

# Enable the provisioning service to run on first boot
mkdir -p "${MOUNT_DIR}/rootfs/etc/systemd/system/multi-user.target.wants"
ln -sf /etc/systemd/system/sbc-provision.service "${MOUNT_DIR}/rootfs/etc/systemd/system/multi-user.target.wants/sbc-provision.service"

# Enable SSH by default for headless troubleshooting
touch "${MOUNT_DIR}/boot/ssh"

echo "7. Unmounting and cleaning up..."
umount "${MOUNT_DIR}/boot"
umount "${MOUNT_DIR}/rootfs"
losetup -d "$LOOP_DEV"
rm -rf "$MOUNT_DIR"

echo "========================================================================"
echo "Success! Custom image created: $CUSTOM_IMG"
echo ""
echo "You can now flash this image to a MicroSD card using Raspberry Pi Imager,"
echo "BalenaEtcher, or dd:"
echo "  sudo dd if=$CUSTOM_IMG of=/dev/sdX bs=4M status=progress"
echo ""
echo "On first boot, the Pi will automatically install Node.js, Chromium,"
echo "build the Next.js app, and start the kiosk. This first boot will take"
echo "about 10-15 minutes. Subsequent boots will be fast."
echo "========================================================================"
