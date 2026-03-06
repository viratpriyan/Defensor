import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../utils/constants';
import Icon from 'react-native-vector-icons/Feather';

const ContactCard = ({ contact, onDelete, onEdit }) => {
    return (
        <View style={styles.card}>
            <View style={styles.infoContainer}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{contact.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                    <Text style={styles.name}>{contact.name}</Text>
                    <Text style={styles.phone}>{contact.phone}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                    <Icon name="edit-3" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { marginLeft: 10 }]} onPress={onDelete}>
                    <Icon name="trash-2" size={18} color={COLORS.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.darkSurface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    name: {
        color: COLORS.darkSurface,
        fontSize: 16,
        fontWeight: '800',
    },
    phone: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 2,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    }
});

export default ContactCard;
