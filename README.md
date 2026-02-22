
Explaining which one to use.
Scaling AnalysisBrief written summary explaining how you would scale this to handle 1,000+ concurrent video users (SFU/MCU vs P2P considerations){\rtf1}

I think its best to use SFU or MCU rather than the P2P model for the following reasons:

1. Scalability: SFU/MCU can handle a large number of concurrent users, while P2P can only handle a small number of users.
2. Cost: SFU/MCU is more cost-effective than P2P, as it requires fewer servers.
3. Reliability: SFU/MCU is more reliable than P2P, as it has built-in redundancy.




## Setup Instructions

### 1. Install Dependencies
Run the following instructions to install all required libraries:
```sh
npm install
```

### 2. Install iOS Pods
Make sure you are in the root directory, then run the CocoaPods installation:
```sh
npx pod-install
```

### 3. Run the Application
Start the Metro server first:
```sh
npm start
```
Then, in a separate terminal, run the app on your preferred platform:
```sh
# For Android:
npm run android

# For iOS:
npm run ios


