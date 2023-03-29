# `mealmaster`

A nutrition app that helps you find recipes and recommendations based on your diet. Worked in collaboration with [@shreyvish5678](https://github.com/shreyvish5678) for [Cross-Club Hacks](https://cross-club.github.io/).

## Inspiration
Our main source of inspiration came from our nutrition lesson in Biology Class. As me and my friend were talking about nutrition, and how it’s often overlooked. Then we found out about this hackathon. Knowing that we wanted to help people with nutrition, and now had the chance to do so, we began!
## What it does
Our app, called Meal-Master, gives users what they can eat, based on their diets. First, you can enter some information, such as weight, height, and more, to get your Daily _Recommended_ Intake (DRI). Next the app compares this with their actual intake, and does this by inputting their meals throughout the day, and then calculating it. Then by comparing the two, the app figures out the user's needs. By telling the prompt to ChatGPT’s AI, it can give ingredients and recipes that the user can eat. Then they can look up those recipes on the app, and look at all the information, and a link to the website.
## How we Built it
Our application consists of Expo and React Native for the frontend mobile application. This application connects to a tRPC server that runs on a Vercel Lambda instance built using Next.js. For receiving the nutrition and recommendation data, we made use of the Edaman and OpenAI API respectively. While building our backend we prototyped our API routes in Python and then translated it to TypeScript for our tRPC server.
## Challenges we had
Installing the ChatGPT API was a hassle, since the documentation for it was a bit confusing but we figured it out.
Trying to set up a development environment to work with our app. 
## Accomplishments we’re proud of
Using the ChatGPT API, as we could basically use ChatGPT in our own code
Working with an enterprise-grade modern mobile application development workflow
## What we learned
Learned more about API Installation, and how to use the documentation properly.
Learned how to work with OpenAI systems.
Working with tRPC in the backend
## What’s next for Meal-Master
Due to the shortage of time that we had, we weren’t obviously able to build a perfect nutrition app with all the features we wanted, and be able to refine it well. So we will implement new ideas into the app, and maybe make our own API, since the ones we were dealing with, aren’t the best.

What we used:
- Python
- OpenAI
- Edamam
- Expo
- React Native
- TypeScript
- tRPC
- Prisma
