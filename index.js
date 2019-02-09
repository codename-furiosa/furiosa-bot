const { Probot } = require('probot')
const cors = require('cors')
let request = require('request');

module.exports = app => {

    const router = app.route('/furiosa')

    // Use any middleware
    router.use(require('express').static('public'))
    router.use(cors());
    router.use(require('express').json());

    router.get('/hello-world', cors(), async (req, res) => {
        console.log("hit");
        let test = await app.auth(639058);
        let aaa = await test.repos.listForOrg({'org':'codename-furiosa'});
        //return aaa;
        res.send(aaa)
    })

    router.post('/milestone', cors(), async (req, res) => {
        try {
            const github = await app.auth(639058);
            const result = await github.issues.createMilestone({'owner': 'codename-furiosa', 'repo': req.body.repo, 'title': 'created milestone'});
            res.send(result)
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    })

    router.post('/team', (req, res) => {
        res.send('Hello World')
    })

    app.log('Yay, the app was loaded!')

    app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })

    //return context.github.issues.createComment(issueComment)
    try {
        test = await context.github.teams.create({'org': 'codename-furiosa', 'name':'test-team'});
        console.log("#################success#################")
        console.log(test);
        return test;
    } catch (err) {
        console.log("#################error#################")
        console.log(err);
    }
    })

    /* ##### ON INSTALLATION ##### */
    app.on('installation', async context => {
        let installation_id = context.payload.installation.id;
        let github_url = context.payload.installation.account.html_url;
        request(
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                uri: 'http://localhost:8080/api/installations/' + installation_id,
                body: JSON.stringify(context.payload)
            },
            (error, response, body) => {
                if(response.statusCode == 200){
                    console.log('Installation saved')
                } else {
                    console.log('error: '+ response.statusCode)
                    console.log(body)
                }
            }
        );
        request(
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                uri: 'http://localhost:8080/api/campaigns',
                qs: { github_url: github_url },
                body: JSON.stringify({ installation_id: installation_id })
            },
            (error, response, body) => {
                if(response.statusCode == 200){
                    console.log('Installation saved')
                } else {
                    console.log('error: '+ response.statusCode)
                    console.log(body)
                }
            }
        );
    })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
