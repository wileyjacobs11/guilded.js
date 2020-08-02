const axios = require("axios");

class Message {
    constructor(client, message, channel) {
        this.client = client;
        this.channel = channel;

        this.guildedClientId = message["guildedClientId"];
        this.id = message["contentId"];
        this.contentType = message["contentType"];
        this.message = message["message"];
        this.teamId = message["teamId"];
        this.authorId = message["creatyBy"];
    }

    react(reaction) {
        var config = {
            method: 'post',
            url: 'https://api.guilded.gg/channels/'+ this.channel.id +'/messages/'+ this.id +'/reactions/'+reaction,
            headers: { 
                'Cookie': this.client.cookies
            }
        };

        return axios(config)
            .then(function (response) {
            //console.log(JSON.stringify(response.data));
            return;
            })
            .catch(function (error) {
            console.log(error);
            });
    }

    async awaitReactions(waitTime) {
        var self = this;

        var reactionList = [];

        function onReaction(msg) {
            if(msg["message"]["id"] == self.id) {
                reactionList.push(msg);
            }
        }

        this.client.on("reactionAdded", onReaction);

        var promise = new Promise((resolve, reject) => {
            setTimeout(waitForMessage, waitTime);
            function waitForMessage(){
                self.client.removeListener("reactionAdded", onReaction);
                return resolve(reactionList);
            }
        })

        return await promise;
    }

    getLineContent(n) {
        if(!this.message.content.document.nodes[n-1]) return;
        var lineType = this.message.content.document.nodes[n-1].type;

        var content = "";

        if(lineType == "paragraph") {
            this.message.content.document.nodes[n-1].nodes.forEach(element => {
                console.log(element);
                if(element.object == "text") {
                    content += element.leaves[0].text;
                }
                if(element.object == "inline") {
                    if(element.type == "mention") {
                        content += element.nodes[0].leaves[0].text;
                    }
                }
            });
            //content = this.message.content.document.nodes[n-1].nodes[0].leaves[0].text;
        }
        if(lineType == "markdown-plain-text") {
            content = this.message.content.document.nodes[n-1].nodes[0].leaves[0].text;
        }
        if(lineType == "webhookMessage") {
            content = this.message.content.document.nodes[n-1].data.embeds.description;
        }
        if(lineType == "block-quote-container") {
            content = this.message.content.document.nodes[n-1].nodes[0].nodes[0].leaves[0].text;
        }

        return content;
    }
}

module.exports = Message;