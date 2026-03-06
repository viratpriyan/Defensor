import { useContext, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { AuthContext } from '../../context/AuthContext';
import { useEmergencyTrigger } from '../../hooks/useEmergencyTrigger';
import { useLocation } from '../../hooks/useLocation';
import { triggerEmergencyCall } from '../../utils/helpers';
import { COLORS, SHADOWS, GRADIENTS } from '../../utils/constants';

const SosScreen = ({ navigation }) => {
    const { activateEmergency, stopEmergency } = useEmergencyTrigger();
    const { location } = useLocation();
    const { user } = useContext(AuthContext);
    const [pulseAnim] = useState(new Animated.Value(1));

    const contacts = user?.emergencyContacts || [];

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [pulseAnim]);

    const handleStop = () => {
        stopEmergency();
        navigation.goBack();
    };

    return (
        <LinearGradient
            colors={GRADIENTS.dark}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>EMERGENCY ACTIVE</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>GPS BROADCASTING</Text>
                </View>
            </View>

            <View style={styles.pulseContainer}>
                <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => activateEmergency(location)}
                    >
                        <LinearGradient
                            colors={GRADIENTS.danger}
                            style={styles.sosCircle}
                        >
                            <Text style={styles.sosText}>SOS</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Active Guardians</Text>
                <View style={styles.contactsCard}>
                    {contacts.length > 0 ? (
                        contacts.slice(0, 3).map((contact, index) => (
                            <View key={contact.id || index} style={styles.contactItem}>
                                <View style={styles.contactAvatar}>
                                    <Icon name="user" size={16} color={COLORS.white} />
                                </View>
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactName}>{contact.name}</Text>
                                    <Text style={styles.contactStatus}>Alerted • Tracking</Text>
                                </View>
                                <Icon name="check-circle" size={20} color={COLORS.success} />
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No active responders.</Text>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.policeBtnWrapper}
                    onPress={() => triggerEmergencyCall('100')}
                >
                    <LinearGradient
                        colors={GRADIENTS.danger}
                        style={styles.policeButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Icon name="shield" size={24} color={COLORS.white} style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Call Police (100)</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={handleStop}>
                    <Text style={styles.cancelText}>DEACTIVATE EMERGENCY</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: 2,
    },
    statusBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    statusText: {
        color: COLORS.danger,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    pulseContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseCircle: {
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sosCircle: {
        width: 170,
        height: 170,
        borderRadius: 85,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.danger,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    sosText: {
        color: COLORS.white,
        fontSize: 54,
        fontWeight: '900',
    },
    infoSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    contactsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    contactAvatar: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.white,
    },
    contactStatus: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 2,
    },
    footer: {
        marginBottom: 20,
    },
    policeBtnWrapper: {
        borderRadius: 20,
        ...SHADOWS.danger,
    },
    policeButton: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 12,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    cancelButton: {
        marginTop: 20,
        padding: 10,
        alignItems: 'center',
    },
    cancelText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        fontSize: 13,
    }
});

export default SosScreen;
