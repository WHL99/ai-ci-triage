fileVersion=$(cat .nvmrc)
machineVersion=$(node -v)



if [ "$fileVersion" != "${machineVersion#v}" ]
then
    echo "Node version mismatch. The project requires Node v$fileVersion. Your current Node is $machineVersion. Please run nvm use $fileVersion" >&2
    exit 1
fi
