# FRONT END

## Setup

### Environment variables

- EXPO_PUBLIC_BASE_URL = back end URL - see Post Installation Usage below for setting up this variable
- Ensure that your front end port matches your back end environemtn variables

### Installation and start

1. Install dependencies

   ```
   npm install
   ```

2. Start the app

   ```
   npm run start
   ```

### Post installation usage - web vs mobile

After start, you would see something such as:
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▄▀▀▄▄▀▀█ █ ▄▄▄▄▄ █
█ █ █ ███▄█ ███ █ █ █
█ █▄▄▄█ ██▄▀▄▀ ██▀█ █▄▄▄█ █
█▄▄▄▄▄▄▄█ █ ▀▄▀ ▀ █▄▄▄▄▄▄▄█
█ █ ▄█▄▀█ ▄▄▀▀█▀ █▄█▀█▀▀▄█
█▄█▄ ▀▄▄▀▀ ▀█▄▄▀▀███▄▀▀ █
█▀▄▀█▄ ▄▄▄▄█▄▄▀▄ █ ▄▀▀█▀ ██
█ ▄▄ ▀█▄ ▀█▀ ▄▄▀ ▄▀ ██▄▀ █
█▄██▄██▄▄▀▀█▀▀ █ ▄▄▄ ▄▀▄█
█ ▄▄▄▄▄ ██▄▄▄▀ █ █▄█ ██▀▄█
█ █ █ █ █▄██▄ ▄ ▄ █ █
█ █▄▄▄█ █▀▄▀█▄▄▄ ▄█▀▀▄█ █
█▄▄▄▄▄▄▄█▄▄▄█▄▄▄▄▄▄█▄▄███▄█

› Scan the QR code above to open in Expo Go.
› Metro: exp://x.x.x.x:8082
› Web: http://localhost:8082

## USING WEB:

- Set the EXPO_PUBLIC_BASE_URL variable to http://localhost:[BACK END PORT]; e.g. http://localhost:3001
  This will setup the front end to communicate with the correct backend

- As previously mentioned, MAKE SURE that the backend also communicates with the correct front end by using the correct port (8082 in setup) (in the BE variables)

- local host might not work, if this happens - use https://127.0.0.1:[PORT] - both in the respective back end and front end variables

- Simply use the web url provided in your browser

## USING MOBILE

- Install the expo go app on your phone

- MAKE SURE that your phone and laptop/hosting machine are on the same wifi/mobile network
- Copy only the Metro IP address (x.x.x.x) - this is the IP of your hosting machine within the network tunnel created for the expo app
- Set the EXPO_PUBLIC_BASE_URL variable to http://x.x.x.x:[BACK END PORT]

- Using the expo go app, scan the QR code or enter the metro url manually (FE port)

---

## BELOW COMES ON BASE EXPO PROJECT SETUP, KEEPING IT FOR NOW IDK

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
