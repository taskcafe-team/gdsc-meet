# 

# Docker Script Usage Guide

This guide explains how to use the `docker-script.sh` file in your project. This script is used to process environment variables, replace them in specific files, and run Docker Compose.

## Steps to Run the Script

1. Open your terminal.

2. Navigate to the directory containing the `docker-script.sh` file.

    ```bash
    cd /path/to/directory
    ```

3. Make sure the script file has execute permissions. If not, run the following command:

    ```bash
    chmod +x docker-script.sh
    ```

4. Run the script:

    ```bash
    ./docker-script.sh
    ```

## What the Script Does

1. **Environment Variable Processing**: The script starts by reading the `.env` file and exporting the environment variables.

2. **Check Environment Variables**: It checks if the environment variables exist in the specified files (`./livekit/livekit.yaml` and `./livekit/egress.yaml`). If any variable is not set, the script will stop and print an error message.

3. **Environment Variable Replacement**: The script replaces the environment variables in the original files with their respective values. It creates a backup of the original files before performing the replacement.

4. **Run Docker Compose**: Finally, the script checks if a Docker network named `proxy-network` exists. If not, it creates one. Then, it runs `docker-compose up --build -d`.

Please ensure that Docker and Docker Compose are installed and running on your system before executing this script.
