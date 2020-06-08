---
name: Telegram Reactions Bot
languages:
  - TypeScript
technologies:
  - Webpack
year: 2020
links:
  github: https://github.com/laptou/reactions-telegram-bot
---
When I got to Cornell, everyone around me insisted on using GroupMe, including
my circle of close friends whom I talk to every day, which was a big problem
because I *hate* GroupMe. This is how I got them to switch to Telegram: by
polyfilling their favourite feature, the ability to react to messages with a ❤️.

The secret sauce of this bot is that it stores user reactions to a message in
the [`callback_data` of the inline
keyboard](https://core.telegram.org/bots/api#inlinekeyboardbutton). This is both
its greatest strength and its greatest weakness: since `callback_data` is stored
by Telegram, I don't have to manage a database or figure out how to scale it up
if this bot sees widespread use. However, since `callback_data` can only contain
64 bytes, I cannot store more than 3 reactions per button: if three people have
already reacted with a ❤️, you might have to settle for a 😂 or a 👍.

In practice, this has turned out to be pretty adequate for my small group chat
of 9 people.
