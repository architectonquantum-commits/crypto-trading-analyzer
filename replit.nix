run = "bash start.sh"
entrypoint = "start.sh"

[nix]
channel = "stable-23_11"

[deployment]
run = ["bash", "start.sh"]