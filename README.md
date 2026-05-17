This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## AI Form Filler MVP

Run both the extension and the local Next.js API:

```bash
pnpm dev
```

Load the Chrome development build from `build/chrome-mv3-dev`.

Use the extension options page to create a local structured profile. Then open `http://localhost:1947/debug-form`, click the extension popup, and choose "Fill this form".

The MVP fills only visible supported fields. It does not submit forms. Profile data is stored locally in extension storage and is sent to the local fill API only when the user clicks fill.

The fill API uses Mastra. Set `FILLER_MODEL` to a Mastra model-router id such as `openai/gpt-5.4`, and configure the matching provider API key in your local environment.

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
