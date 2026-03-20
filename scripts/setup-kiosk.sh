#!/bin/bash

# ==============================================================================
# SBC Cast Hub - Enterprise Kiosk Provisioning Script
# For Pamlico County Schools
# 
# This script configures a Debian/Ubuntu-based Single Board Computer (e.g., 
# Raspberry Pi) to act as a dedicated casting receiver and digital signage kiosk.
# 
# Run this script as root (sudo) on your base golden image.
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

echo "Starting SBC Cast Hub provisioning..."

# 1. Update System and Install Core Dependencies
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

echo "Installing X11, Chromium, and Kiosk utilities..."
apt-get install -y \
  xserver-xorg \
  x11-xserver-utils \
  xinit \
  openbox \
  chromium-browser \
  unclutter \
  curl \
  git \
  avahi-daemon \
  libnss-mdns

# 2. Install Casting Receivers
# Note: uxplay provides AirPlay mirroring. Miracast/Google Cast receivers 
# vary by hardware support. We install uxplay as the standard AirPlay receiver.
echo "Installing UxPlay (AirPlay Receiver)..."
apt-get install -y uxplay

# 3. Install Node.js (v20.x)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 4. Setup the Application Directory
APP_DIR="/opt/sbc-cast-hub"
echo "Setting up application directory at $APP_DIR..."

if [ ! -d "$APP_DIR" ]; then
  mkdir -p "$APP_DIR"
  # In a real deployment, you would clone your private repo here:
  # git clone https://github.com/pamlico-schools/sbc-cast-hub.git $APP_DIR
  echo "Note: Please copy the Next.js application files to $APP_DIR"
fi

# Install PM2 for process management
npm install -g pm2

# 5. Configure the Kiosk User and Autostart
KIOSK_USER="kiosk"

if ! id "$KIOSK_USER" &>/dev/null; then
  echo "Creating $KIOSK_USER user..."
  useradd -m -s /bin/bash "$KIOSK_USER"
  usermod -aG video,audio,render "$KIOSK_USER"
fi

# Create the X11 startup script
echo "Configuring X11 and Chromium kiosk mode..."
cat << 'EOF' > /home/$KIOSK_USER/start-kiosk.sh
#!/bin/bash

# Disable screen blanking and power saving
xset s noblank
xset s off
xset -dpms

# Hide the mouse cursor after 0.5 seconds of inactivity
unclutter -idle 0.5 -root &

# Start the window manager in the background
openbox-session &

# Start Chromium in Kiosk mode
# --noerrdialogs: Suppress crash dialogs
# --disable-infobars: Hide "Chrome is being controlled..."
# --kiosk: Fullscreen mode
exec chromium-browser \
  --noerrdialogs \
  --disable-infobars \
  --kiosk \
  --incognito \
  --check-for-update-interval=31536000 \
  "http://localhost:3000"
EOF

chmod +x /home/$KIOSK_USER/start-kiosk.sh
chown $KIOSK_USER:$KIOSK_USER /home/$KIOSK_USER/start-kiosk.sh

# 6. Create Systemd Service for the Kiosk
echo "Creating systemd service for the kiosk display..."
cat << EOF > /etc/systemd/system/kiosk.service
[Unit]
Description=SBC Cast Hub Kiosk Display
After=network.target network-online.target systemd-user-sessions.service
Wants=network-online.target

[Service]
User=$KIOSK_USER
Group=$KIOSK_USER
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/$KIOSK_USER/.Xauthority
ExecStart=/usr/bin/startx /home/$KIOSK_USER/start-kiosk.sh -- -nocursor
Restart=always
RestartSec=10

[Install]
WantedBy=graphical.target
EOF

systemctl daemon-reload
systemctl enable kiosk.service

echo "========================================================================"
echo "Provisioning complete!"
echo ""
echo "Next steps for the Golden Image:"
echo "1. Copy your Next.js app files to $APP_DIR"
echo "2. Run 'npm install' and 'npm run build' in $APP_DIR"
echo "3. Start the app with PM2: 'pm2 start npm --name \"cast-hub\" -- start'"
echo "4. Save the PM2 state: 'pm2 save' and 'pm2 startup'"
echo "5. Reboot the device to verify it boots directly into the dashboard."
echo "========================================================================"
