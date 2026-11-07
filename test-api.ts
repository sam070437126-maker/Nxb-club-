import axios from 'axios';

async function test() {
    try {
        const res = await axios.get('https://v3.football.api-sports.io/status', {
            headers: { 'x-apisports-key': 'c99171a5658ec12d1ff0e76b772e7275' }
        });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

test();
