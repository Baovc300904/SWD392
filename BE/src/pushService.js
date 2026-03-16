const pushService = require('./services/push.service');

async function sendPush(token, title, body, data = {}) {
    return pushService.sendPush(token, title, body, data);
}

module.exports = {
    sendPush,
    sendQuestionAnsweredToStudent: pushService.sendQuestionAnsweredToStudent.bind(pushService)
};
