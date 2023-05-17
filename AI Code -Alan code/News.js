// {Name: News}
// {Description: Gives the latest headlines on topics like health, science, entertainment, sports, business, and technology. Each news headline has a corresponding image. }

title("News")

const page = 5;
const key = "7bdfb1b10aca41c6becea47611b7c35a";

let TOPICS = ["business", "entertainment", "general", "health", "science", "sports", "technology"];
let TOPICS_INTENT = [];
for (let i = 0; i < TOPICS.length; i++) {
    TOPICS_INTENT.push(TOPICS[i] + "~" + TOPICS[i]);
}
TOPICS_INTENT = TOPICS_INTENT.join('|') + '|';

function apiCall(p, command, param, callback) {
    let jsp = {
        url: "https://studio.alan.app/api_playground/" + command,
        strictSSL: false,
        method: 'POST',
        json: param,
        timeout: 5000,
    };
    api.request(jsp, (err, res, body) => {
        if (err || res.statusCode !== 200) {
            p.play(`(Sorry|) something went wrong (on the server|) ${err} ${res} ${body}`);
        } else if (body.error) {
            p.play(body.error);
        } else {
            callback(body);
        }
    });
}

intent(`(show|what is|tell me|what's|what are|what're|read) (the|) (recent|latest|) $(N news|headlines) (in|about|on|) $(T~ ${TOPICS_INTENT})`,
    `(read|show|get|bring me) (the|) (recent|latest|) $(T~ ${TOPICS_INTENT}) $(N news|headlines)`,
    p => {
        let headlinesUrl = "https://newsapi.org/v2/top-headlines?country=us&apiKey=7bdfb1b10aca41c6becea47611b7c35a";
        let param = {}
        if (p.T.label) {
            param.category = p.T.label;
        }
        apiCall(p, 'getNews', param, response => {
            if (!response.error) {
                let headlines = [];
                let images = [];
                let res = JSON.parse(response.data);
                let articles = res.articles;
                let max = Math.min(page, articles.length);
                for (let i = 0; i < max; i++) {
                    let article = articles[i];
                    let name = article.source.name;
                    let author = article.author;
                    let title = article.title;
                    let description = article.description;
                    let image = article.urlToImage;
                    if (title) {
                        headlines.push(title);
                        images.push(image);
                    }
                }
                p.play({
                    embeddedPage: true,
                    page: "news.html",
                    command: "newHeadlines",
                    headlines: headlines,
                    images: images
                });
                if (p.T && p.T.label) {
                    p.play(`Here are the (latest|recent) $(N headlines) on ${p.T.label}.`,
                        `Here's the (recent|latest) $(N news) on ${p.T.label}.`,
                        `Here are the (latest|recent) ${p.T.label} $(N headlines).`,
                        `Here's the (recent|latest) ${p.T.label} $(N news)`);
                } else {
                    p.play(`Here are the (latest|recent) $(N headlines).`,
                        `Here's the (latest|recent) $(N news).`);
                }
                for (let y = 0; y < headlines.length; y++) {
                    p.play({
                        embeddedPage: true,
                        command: "highlight",
                        page: "news.html",
                        head: headlines[y],
                        image: images[y]
                    });
                    p.play(`${headlines[y]}`);
                }
                p.play({embeddedPage: true, command: "unSelect"});
            } else {
                console.log(response.error);
            }
        });
    });


intent(`(types|categories|topics) (of|in) the news (now|)`, `What (types|categories|topics) of news do you have?`,
    reply(`We provide news on ` + TOPICS.join(", ")));
