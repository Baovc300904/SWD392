function isPrivilegedRole(role) {
    const normalized = String(role || '').toLowerCase();
    return normalized === 'lecturer' || normalized === 'manager' || normalized === 'admin';
}

function toNumericSet(values) {
    const result = new Set();
    for (const value of values || []) {
        const parsed = Number(value);
        if (Number.isInteger(parsed) && parsed > 0) {
            result.add(parsed);
        }
    }
    return result;
}

function buildStudentVisibilityScope(memberships) {
    const groupIds = [];
    const topicIds = [];

    for (const membership of memberships || []) {
        const groupId = Number(membership?.groupId || membership?.group?.id);
        const topicId = Number(membership?.group?.topicId);

        if (Number.isInteger(groupId) && groupId > 0) {
            groupIds.push(groupId);
        }
        if (Number.isInteger(topicId) && topicId > 0) {
            topicIds.push(topicId);
        }
    }

    return {
        groupIds: toNumericSet(groupIds),
        topicIds: toNumericSet(topicIds)
    };
}

function canStudentViewQuestion({ questionIsPublic, askingGroupId, askingTopicId, studentScope }) {
    const groupId = Number(askingGroupId);
    if (Number.isInteger(groupId) && studentScope?.groupIds?.has(groupId)) {
        return true;
    }

    if (!questionIsPublic) {
        return false;
    }

    const topicId = Number(askingTopicId);
    return Number.isInteger(topicId) && studentScope?.topicIds?.has(topicId);
}

function canStudentViewAnswer({ answerIsPublic, askingGroupId, askingTopicId, studentScope }) {
    const groupId = Number(askingGroupId);
    if (Number.isInteger(groupId) && studentScope?.groupIds?.has(groupId)) {
        return true;
    }

    if (!answerIsPublic) {
        return false;
    }

    const topicId = Number(askingTopicId);
    return Number.isInteger(topicId) && studentScope?.topicIds?.has(topicId);
}

module.exports = {
    isPrivilegedRole,
    buildStudentVisibilityScope,
    canStudentViewQuestion,
    canStudentViewAnswer
};
