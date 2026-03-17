/**
 * GROUP CONTROLLER ADDITIONS
 * Add this new method to d:\GitHub\SWD392\BE\src\controllers\group.controller.js
 */

/**
 * @desc    Lecturer confirms/chốt group
 * @route   PUT /api/groups/:id/confirm
 * @access  Lecturer/Manager
 * @note    Only lecturer of the class can confirm their group
 */
const confirmGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const lecturerId = getRequesterId(req);
        const role = getRequesterRole(req);

        // Find group with its associated class
        const group = await StudentGroup.findByPk(id, {
            include: [{
                model: Class,
                as: 'class',
                attributes: ['id', 'lecturerId']
            }]
        });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND
            });
        }

        // Verify lecturer is authorized
        if (role === 'lecturer' && group.class.lecturerId !== lecturerId) {
            return res.status(403).json({
                success: false,
                message: 'Only the class lecturer can confirm this group'
            });
        }

        // Update group
        await group.update({
            group_status: 'CONFIRMED',
            confirmed_by: lecturerId,
            confirmed_at: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Group confirmed successfully',
            data: group
        });
    } catch (error) {
        console.error('Error confirming group:', error);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { confirmGroup };
