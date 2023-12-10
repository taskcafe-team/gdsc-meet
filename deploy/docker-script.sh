#*---------------- Environment Variable Processing ----------------*#
echo "Starting environment variable processing..."
# Read the .env file and export the environment variables
if [ ! -f .env ]; then
  # If the file doesn't exist, print an error message and exit the script
  echo "The .env file does not exist. Exiting..."
  exit 1
fi

export $(egrep -v '^#' .env | xargs)

# List of files where environment variables need to be replaced
files=("../livekit/livekit.yaml" "../livekit/egress.yaml" "../traefik/traefik.yaml")

#* Check if environment variables exist
echo "Checking if environment variables exist..."

# Initialize an associative array
declare -A env_vars

# Loop through all the files
for file in "${files[@]}"; do
  # Find all the environment variables in the file
  vars_in_file=$(grep -oP '\$\{\K[^}]+' "$file")

  # Loop through all the found environment variables
  for var in $vars_in_file; do
    # Add the variable to the associative array
    env_vars[$var]="$file"
  done
done

missing_vars=0
for var in "${!env_vars[@]}"; do
  # Check if the environment variable exists
  if [ -z "${!var}" ]; then
    # If the environment variable does not exist, print a red error message
    echo -e "Environment variable: \033[31m$var\033[0m is not set, in \033[31m${env_vars[$var]}\033[0m"
    missing_vars=1
  fi
done

# If any environment variable does not exist, stop the script
if [ $missing_vars -eq 1 ]; then
  echo "Some environment variables are missing. Exiting..."
  exit 1
fi

#* Perform environment variable replacement
echo "Performing environment variable replacement..."
# Function to restore files
restore_files() {
  echo "Restoring files..."
  for file in "${files[@]}"; do
    if [ -f "$file.bak" ]; then
      mv "$file.bak" "$file"
    fi
  done
}

# Set a trap to call the restore_files function when the script ends
trap restore_files EXIT

# Define ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

for file in "${files[@]}"; do
  # Create a copy of the original file
  cp "$file" "$file.bak"

  # Loop through all the environment variables
  echo -ne "${GREEN}Processing ${file}...${NC}"
  for varname in $(compgen -e); do
    # Replace the environment variable name in the original file with its value
    sed -i "s/\${${varname}}/${!varname}/g" "$file" >/dev/null 2>&1 &
  done
  echo -e "${BLUE} done${NC}"
done

#*---------------- Run Docker Compose ----------------*#
echo -e "${GREEN}Running Docker Compose...${NC}"
# Name of the network
network_name="proxy-network"

# Check if the network already exists
if [ -z "$(docker network ls --filter name=^${network_name}$ --format={{.Name}})" ]; then
  # If the network does not exist, create a new one
  echo -e "${GREEN}Creating network ${network_name}...${NC}"
  docker network create ${network_name}
else
  echo -e "${BLUE}Network ${network_name} already exists.${NC}"
fi

# Run docker-compose
echo -e "${GREEN}Running docker-compose up --build -d...${NC}"
docker-compose up --build -d "$@"
echo -e "${RED}Script completed.${NC}"
