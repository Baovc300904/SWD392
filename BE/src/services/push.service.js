const firebaseService = require('./firebase.service');

class PushService {
    async sendPush(token, title, body, data = {}) {
        return firebaseService.sendToToken({
            token,
            title,
            body,
            data
        });
    }

    async sendQuestionAnsweredToStudent({ token, questionId, answerId, actorRole = 'lecturer', answerPreview = '' }) {
        if (!token) {
            return { success: false, skipped: true, reason: 'empty-token' };
        }

        const role = String(actorRole || '').toLowerCase();
        const actorLabel = role === 'manager' ? 'Quan ly' : 'Giang vien';

        return this.sendPush(
            token,
            'Cau hoi cua ban da co phan hoi',
            `${actorLabel} da tra loi: ${answerPreview}`,
            {
                type: 'question_answered',
                screen: 'question',
                event: 'answer_created',
                questionId,
                answerId
            }
        );
    }
}

module.exports = new PushService();
