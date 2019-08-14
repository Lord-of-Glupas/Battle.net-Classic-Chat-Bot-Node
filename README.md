# Battle.net-Classic-Chat-Bot-Node

- Modified for node support: https://github.com/Stannnnn/Battle.net-Classic-Chat-HTML-JS-CSS
- Thanks to: https://github.com/OneMeanDragon/Battle.net-Classic-Chat-HTML-JS-CSS

### Commands
Beside the usual moderation commands you can also use:
- rkick <regex> ( regex kick, kick using regex to match usernames )
- rban <regex> ( regex ban, ban using regex to match usernames )
- arkick <regex> ( auto regex kick, since ban doesn't work, love you blizz. Will autokick anyone matching the regex, there is no command to undo this. Edit the config yourself and restart the bot. )

#### Required tools:
- NodeJS ( https://nodejs.org/en/ )
- NPM ( https://www.npmjs.com/ )

#### Initialize:
Rename 'config.json.example' to 'config.json'
Enter your API Key. ( Obtainable by typing /register-bot as chief in a Warcraft channel )
Change 'clan_miss_ftw' to whatever you please to describe the bot which will now be known as <bot_name>.

Supports multiple bots.

#### To run:
- node main.js <bot_name>

E.g. node main.js clan_miss_ftw
