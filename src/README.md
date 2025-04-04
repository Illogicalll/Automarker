# AutoAssign

AutoAssign is a robust and streamlined solution to the modern nightmare of coding assignments for large student cohorts.

## Codebase Overview

Within this `/src/` folder there are 7 folders:

- `__tests__`: contains the *Jest* unit tests for the project
- `app`: contains the pages and site structure
- `components`: contains various re-usable UI components used to construct the site
- `lib`: contains a utility function file
- `public`: contains site assets
- `utils`: contains various useful functions to do with authentication, redirects, and more

Aside from the folders, there are also various configuration files such as `tsconfig.json` or `jest.config.js`. These specify many parameters that are important for the project to run.

## Requirements

The following technologies are required to facilitate the automated unit test execution API:

- MacOS/Linux based system
- `node`
- `cmake`
- `gnu-time` (MacOS) / `time` (Linux)
- `openjdk`
- `maven`
- `python3`

These can all be installed with the following commands:

- MacOS:
  - `brew install node cmake gnu-time openjdk maven python3` (requires `homebrew`)
- Linux:
  - `sudo apt update && sudo apt install -y nodejs build-essential cmake time default-jdk maven python3 python3-pip python3-venv`

## Setup Instructions

- Clone from the GitHub repository [here](https://github.com/Illogicalll/Automarker)
- Open a terminal window in the cloned repository and navigate to the `/src/` folder
- Run `npm i`
- Create a file called `.env.local`
- Create three environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_HF_API_KEY`
- Contact me at [2766915M@student.gla.ac.uk](mailto:2766915M@student.gla.ac.uk) or [contact@w-murphy.com](mailto:contact@w-murphy.com) for the values
- Run `npm run dev`
- Navigate to `localhost:3000` (port may be different if `3000` is in use)

## Testing

If you wish to execute the unit tests for yourself to ensure the code is functional, do the following:

- In the `/src/` folder find `tsconfig.json`
- Change the value of `"jsx"` from `"preserve"` to `"react-jsx"`
- Save the file
- In your terminal run `npx jest`
