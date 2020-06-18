# Portfolio

This is where my portfolio website lives. It is written in TypeScript with Webpack on the client side, and of course, Java Servlets on the server side. All of the files on the client side are converted into JavaScript by Webpack using various loaders, which allows me to use technologies that will not work in browsers directly, such as TypeScript and Sass.

## How to deploy

```bash
# build the client side assets
cd src/main/client
npm install
npm run build

# deploy the website
cd ../../..
mvn package appengine:deploy
```

## Important folders

### `src/main/client/res`

This is where all of the non-TypeScript client-side resources for my app live. 

#### `src/main/client/res/dl`

Random files intended to be downloaded by the user. Currently contains my resumé.

#### `src/main/client/res/icon`

SVG icons that are used for UI elements.

#### `src/main/client/res/img`

Images that are displayed on my website, such as photos of food.

#### `src/main/client/res/misc`

Random files that are not for the user to download. Currently contains a mapping of 2-letter
language codes to the names of the languages.

#### `src/main/client/res/style`

All of the styles for my app. They are imported where they are needed using `import` statements in
TypeScript, so that any styles that go unused can automatically be eliminated from the final bundle
by Webpack.

### `src/main/client/src`

This is where all of the TypeScript client-side code for my app lives.

#### `src/main/client/src/components/controls`

These are reusable, generic controls used in my website.

#### `src/main/client/src/components/pages`

These are the pages of my website. Since there's only one, there's also no router or navigation.
This is a *true* SPA.

#### `src/main/client/src/components/sections`

These are the sections of the pages of my website. Since each one is relatively complicated and they
don't interact with each other, I separated them into different modules.

#### `src/main/client/src/util`

Helper functions and classes, the most important of which is the `htmlFragment` [template literal
tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates).
I use this in almost every file in this project (which is why there are no HTML files).
