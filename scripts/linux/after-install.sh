#!/bin/bash

# Post-installation script for KTClaw on Linux

set -e

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database -q /usr/share/applications || true
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -q /usr/share/icons/hicolor || true
fi

# Create symbolic link for KTClaw app binary
if [ -x /opt/KTClaw/clawx ]; then
    ln -sf /opt/KTClaw/clawx /usr/local/bin/clawx 2>/dev/null || true
fi

# Create symbolic link for openclaw CLI
OPENCLAW_WRAPPER="/opt/KTClaw/resources/cli/openclaw"
if [ -f "$OPENCLAW_WRAPPER" ]; then
    chmod +x "$OPENCLAW_WRAPPER" 2>/dev/null || true
    ln -sf "$OPENCLAW_WRAPPER" /usr/local/bin/openclaw 2>/dev/null || true
fi

# Set chrome-sandbox permissions.
#
# Strategy (three-tier):
#   1. If user namespaces work  → 0755 is sufficient (modern Ubuntu/Debian default)
#   2. If namespaces are locked  → SUID 4755 lets Chromium use the setuid sandbox
#   3. On Kylin / UOS / restricted kernels that block BOTH namespaces AND setuid,
#      the app itself injects --no-sandbox at runtime, so sandbox binary perms
#      become moot — we still set 4755 as best-effort.
#
# Note: kernel.unprivileged_userns_clone=0 is the default on Kylin V10/V11 and
# some hardened Debian-derivative builds. unshare --user will fail there.

SANDBOX_BIN='/opt/KTClaw/chrome-sandbox'

if [ -f "$SANDBOX_BIN" ]; then
    if unshare --user true 2>/dev/null; then
        # User namespaces available — standard permissions are fine
        chmod 0755 "$SANDBOX_BIN" || true
    else
        # No user namespace support — enable SUID setuid-sandbox as fallback.
        # This covers Kylin V10/V11, UOS, and other hardened government Linux distros.
        chmod 4755 "$SANDBOX_BIN" || true
    fi
fi

# Install AppArmor profile (Ubuntu 24.04+).
# Ubuntu 24.04 enables kernel.apparmor_restrict_unprivileged_userns=1 by default,
# which blocks Electron's sandbox. The bundled AppArmor profile grants the 'userns'
# permission so the app can create user namespaces without disabling the global policy.
#
# We first check if AppArmor is enabled and if the running version supports abi/4.0
# (Ubuntu 22.04 does not; it runs fine without the profile, so we skip it there).
if apparmor_status --enabled > /dev/null 2>&1; then
    APPARMOR_PROFILE_SOURCE='/opt/KTClaw/resources/apparmor-profile'
    APPARMOR_PROFILE_TARGET='/etc/apparmor.d/clawx'
    if [ -f "$APPARMOR_PROFILE_SOURCE" ] && \
       apparmor_parser --skip-kernel-load --debug "$APPARMOR_PROFILE_SOURCE" > /dev/null 2>&1; then
        cp -f "$APPARMOR_PROFILE_SOURCE" "$APPARMOR_PROFILE_TARGET"

        # Skip live-loading in a chroot environment (e.g. image-building pipelines).
        if ! { [ -x '/usr/bin/ischroot' ] && /usr/bin/ischroot; } && hash apparmor_parser 2>/dev/null; then
            apparmor_parser --replace --write-cache --skip-read-cache "$APPARMOR_PROFILE_TARGET" || true
        fi
    else
        echo "Skipping AppArmor profile installation: profile not found or AppArmor version incompatible"
    fi
fi

echo "KTClaw has been installed successfully."
