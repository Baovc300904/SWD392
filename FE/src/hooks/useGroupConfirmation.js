/**
 * LECTURER VIEW - GROUP CONFIRMATION
 * File: d:\GitHub\SWD392-FrontEnd\src\hooks\useGroupConfirmation.js
 * Hook để quản lý confirm group
 */

import { useState } from 'react';
import { toast } from 'sonner';
import api from '../config/api.config';

export const useGroupConfirmation = () => {
    const [confirming, setConfirming] = useState(false);

    const confirmGroup = async (groupId) => {
        if (!groupId) {
            toast.error('Invalid group ID');
            return false;
        }

        setConfirming(true);
        try {
            const payload = await api.put(`/groups/${groupId}/confirm`);

            if (payload?.success) {
                toast.success('Group confirmed successfully! ✓');
                return true;
            } else {
                toast.error(payload?.detail || payload?.message || 'Failed to confirm group');
                return false;
            }
        } catch (error) {
            console.error('Error confirming group:', error);
            const message = error?.data?.detail || error?.data?.message || error?.message || 'Failed to confirm group';
            toast.error(message);
            return false;
        } finally {
            setConfirming(false);
        }
    };

    return { confirmGroup, confirming };
};
