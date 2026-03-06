import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { getContacts } from '../../services/authService';
import { COLORS, GRADIENTS, SHADOWS } from '../../utils/constants';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [guardians, setGuardians] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchGuardians = async () => {
                try {
                    setIsLoading(true);
                    const res = await getContacts();
                    if (res.success) {
                        setGuardians(res.data);
                    }
                } catch (error) {
                    console.error("Failed to load guardians", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchGuardians();
        }, [])
    );

    const name = user?.name || "Secure Profile";
    const phone = user?.phone || "Private";

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header Section */}
            <View style={styles.header}>
                <LinearGradient
                    colors={GRADIENTS.dark}
                    style={styles.headerGradient}
                >
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Icon name="user" size={44} color={COLORS.primary} />
                        </View>
                    </View>
                    <Text style={styles.profileName}>{name}</Text>
                    <Text style={styles.profilePhone}>{phone}</Text>
                </LinearGradient>
            </View>

            {/* Guardians Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Registered Guardians</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Emergency', { screen: 'EmergencyContacts' })}>
                        <Text style={styles.manageText}>Manage</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.guardiansList}>
                        {[1, 2, 3].map((index) => {
                            const guardian = guardians[index - 1];
                            return (
                                <View key={index} style={styles.guardianSlot}>
                                    <View style={styles.slotHeader}>
                                        <Text style={styles.slotLabel}>GUARDIAN {index}</Text>
                                        {guardian && <Icon name="shield" size={12} color={COLORS.safe} />}
                                    </View>

                                    {guardian ? (
                                        <View style={styles.guardianCard}>
                                            <View style={styles.guardianAvatar}>
                                                <Text style={styles.guardianInitial}>{guardian.name.charAt(0).toUpperCase()}</Text>
                                            </View>
                                            <View style={styles.guardianInfo}>
                                                <Text style={styles.guardianName}>{guardian.name}</Text>
                                                <Text style={styles.guardianPhone}>{guardian.phone}</Text>
                                            </View>
                                            <Icon name="check-circle" size={20} color={COLORS.safe} />
                                        </View>
                                    ) : (
                                        <View style={styles.emptySlot}>
                                            <Text style={styles.emptySlotText}>No guardian registered in slot {index}</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>

            {/* Account Actions */}
            <View style={styles.actionSection}>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Icon name="log-out" size={20} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        marginBottom: 24,
    },
    headerGradient: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...SHADOWS.dark,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 30,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary + '44',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.darkSurface,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
    },
    profilePhone: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
        letterSpacing: 1,
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.darkSurface,
    },
    manageText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '700',
    },
    guardiansList: {
        gap: 16,
    },
    guardianSlot: {
        marginBottom: 4,
    },
    slotHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    slotLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.textSecondary,
        letterSpacing: 1.5,
    },
    guardianCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    guardianAvatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.darkSurface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    guardianInitial: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    guardianInfo: {
        flex: 1,
    },
    guardianName: {
        color: COLORS.darkSurface,
        fontSize: 16,
        fontWeight: '800',
    },
    guardianPhone: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    emptySlot: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    emptySlotText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        fontStyle: 'italic',
    },
    actionSection: {
        paddingHorizontal: 24,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.darkSurface,
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.danger,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        ...SHADOWS.danger,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
});

export default ProfileScreen;
