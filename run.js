'use strict';
const request = require('request');
const _ = require('lodash');
const fs = require('fs');

writeReadme();
writeAvailable();

function writeReadme() {
    const url = 'https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json';

    const preamble = '# GitHub Emoji\n';

    const heading = '\n## {0}\n\n';
    const header = '| Emoji | Aliases | Description | Tags |\n| --- | --- | --- | --- |\n';
    const row = '| <span id="{0}">:{1}:</span> | {2} | {3} | {4} |\n';
    const cell = '`:{0}:`';

    const postamble = `\n# Build\n\nThis file is generated from the data in ${url}\n\n1. \`npm install\`\n2. \`npm run start\`\n`;

    request.get({
        url: url,
        json: true,
        headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
        if (err) {
            return console.log('Error:', err);
        } else if (res.statusCode !== 200) {
            return console.log('Status:', res.statusCode);
        } else {
            let result = preamble;

            var categories = _(data)
                .groupBy(x => x.category)
                .map((value, key) => ({ name: key, emojis: value }))
                .value();

            for (let index in categories) {
                let category = categories[index];
                result += heading.replace('{0}', (category.name === 'undefined') ? 'Uncategorized' : category.name);
                result += header;

                for (let index in category.emojis) {
                    let emoji = category.emojis[index];
                    let aliases = '';

                    for (let index in emoji.aliases) {
                        if (aliases.length > 0) aliases += ' <br /> ';
                        aliases += cell.replace('{0}', emoji.aliases[index]);
                    }

                    result += row
                        .replace('{0}', emoji.aliases[0])
                        .replace('{1}', emoji.aliases[0])
                        .replace('{2}', aliases)
                        .replace('{3}', emoji.description || '')
                        .replace('{4}', emoji.tags.join(', '));
                }
            }

            result += postamble;

            fs.writeFile("README.md", result, function (err) {
                if (err) {
                    return console.log('Error:', err);
                }
            });
        }
    });
}

function writeAvailable() {
    const url = 'https://api.github.com/emojis';

    const preamble = '# GitHub Emoji\n\n';

    const header = '| Emoji | Alias |\n| --- | --- |\n';
    const row = '| :{0}: | `:{1}:` |\n';

    const postamble = `\n# Build\n\nThis file is generated from the data in ${url}\n\n1. \`npm install\`\n2. \`npm run start\`\n`;

    request.get({
        url: url,
        json: true,
        headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
        if (err) {
            return console.log('Error:', err);
        } else if (res.statusCode !== 200) {
            return console.log('Status:', res.statusCode);
        } else {
            let result = preamble;
            result += header;

            for (let alias in data) {
                result += row
                    .replace('{0}', alias)
                    .replace('{1}', alias);
            }

            result += postamble;

            fs.writeFile("available.md", result, function (err) {
                if (err) {
                    return console.log('Error:', err);
                }
            });
        }
    });
}
