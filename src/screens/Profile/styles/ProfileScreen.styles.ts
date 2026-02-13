/**
 * ProfileScreen Dark Theme Styles
 * ================================
 * Consistent with Dashboard and News dark theme design language
 *
 * Color Palette:
 * - Primary Dark BG: #0B1A1F (deep navy-teal)
 * - Secondary Dark BG: #0D2832 (slightly lighter navy)
 * - Accent Teal: #14B8A6
 * - Text Primary: #FFFFFF (white)
 * - Text Secondary: #B4E4DD (light teal)
 * - Text Tertiary: #6B8A84 (medium teal-gray)
 * - Borders: rgba(20, 184, 166, 0.2) (teal with transparency)
 */

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // ============================================================================
  // LAYOUT
  // ============================================================================
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme primary
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1A1F',
  },

  // ============================================================================
  // HEADER
  // ============================================================================
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0B1A1F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  headerAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerWelcome: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B8A84',
    letterSpacing: 0.3,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  learningInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  learningInfoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ============================================================================
  // SOLID COLOR TABS - CONSISTENT WITH NEWS TAB DESIGN
  // ============================================================================
  tabsContainer: {
    backgroundColor: '#0B1A1F',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.15)',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: '#14B8A6', // SOLID TEAL when active
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  tabContent: {
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B8A84', // Muted teal-gray when inactive
  },
  tabTextActive: {
    color: '#FFFFFF', // WHITE when active (on solid teal)
    fontWeight: '800',
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#0B1A1F', // Dark border to blend
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0D2832', // Slightly lighter dark background
  },

  // ============================================================================
  // WELCOME SECTION - DARK THEME WITH GRADIENT FEEL
  // ============================================================================
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#B4E4DD', // Light teal
    fontWeight: '500',
  },

  // ============================================================================
  // STATS CARDS - GLASSMORPHIC DARK THEME
  // ============================================================================
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardTeal: {
    backgroundColor: '#14B8A6', // Vibrant turquoise
  },
  statCardPurple: {
    backgroundColor: '#8B5CF6', // Vibrant purple
  },
  statCardOrange: {
    backgroundColor: '#FB923C', // Vibrant orange
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 6,
    fontWeight: '600',
    opacity: 0.9,
  },

  // New Statistics Dashboard Cards
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCardLarge: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 160,
  },
  statLargeValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  statLargeLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    opacity: 0.9,
  },
  statCardMedium: {
    flex: 1,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 130,
  },
  statMediumValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 4,
  },
  statMediumLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    opacity: 0.9,
  },
  statCardSmall: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 110,
  },
  statSmallValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 2,
  },
  statSmallLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    opacity: 0.9,
  },
  statCardFullWidth: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 140,
    marginBottom: 12,
  },
  statFullWidthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statFullWidthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statFullWidthContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statFullWidthValue: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statFullWidthSubtext: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.85,
    marginTop: 4,
  },
  statFullWidthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statFullWidthBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ============================================================================
  // SECTION TITLE
  // ============================================================================
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // ============================================================================
  // ACTIVITY CARDS - DARK THEME
  // ============================================================================
  activityList: {
    gap: 12,
  },
  activityCard: {
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.85,
  },
  activityDate: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.75,
  },
  activityDetails: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  activitySummary: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 20,
    opacity: 0.9,
  },

  // ============================================================================
  // EMPTY STATE - DARK THEME
  // ============================================================================
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(11, 26, 31, 0.6)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B4E4DD',
    marginTop: 16,
  },

  // ============================================================================
  // PROGRESS TAB - DARK THEME PREMIUM DESIGN
  // ============================================================================
  progressPlanCard: {
    backgroundColor: '#14B8A6',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  progressPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    gap: 16,
  },
  planFlagContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  progressPlanHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  progressPlanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  progressPlanSubtitle: {
    fontSize: 14,
    color: '#B4E4DD',
    marginBottom: 14,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  progressBarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14B8A6',
    marginTop: 6,
  },
  progressExpandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ============================================================================
  // PROGRESS TAB - EXPANDED CONTENT
  // ============================================================================
  progressPlanDetails: {
    padding: 20,
    backgroundColor: 'rgba(11, 26, 31, 0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.15)',
  },
  skillsAssessmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  skillCard: {
    width: '48%',
    backgroundColor: '#FCD34D',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  skillName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  skillScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillScore: {
    fontSize: 20,
    fontWeight: '800',
    // Color set dynamically based on score
  },
  skillIcon: {
    marginLeft: 'auto',
  },
  skillsSection: {
    marginBottom: 20,
  },
  skillsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  skillsGridHorizontal: {
    flexDirection: 'row',
    gap: 12,
  },
  skillColumn: {
    flex: 1,
    gap: 12,
  },
  skillCardHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 40, 50, 0.6)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    gap: 12,
  },
  skillIconHorizontal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skillInfo: {
    flex: 1,
  },
  skillLabelHorizontal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B4E4DD',
    marginBottom: 2,
  },
  skillScoreHorizontal: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  progressPlanContent: {
    padding: 20,
    backgroundColor: 'rgba(11, 26, 31, 0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 166, 0.15)',
  },
  currentWeekSection: {
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.25)',
  },
  currentWeekHeader: {
    marginBottom: 12,
  },
  currentWeekLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14B8A6',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  currentWeekTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 4,
  },
  currentWeekFocus: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 22,
  },
  currentWeekActivities: {
    gap: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  activityRowText: {
    flex: 1,
    fontSize: 13,
    color: '#B4E4DD',
    lineHeight: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  activityBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
    marginTop: 6,
  },
  activityText: {
    flex: 1,
    fontSize: 13,
    color: '#B4E4DD',
    lineHeight: 20,
  },
  weeklyScheduleSection: {
    marginBottom: 20,
  },
  weeklyScheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  weeksList: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  weekItem: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
    backgroundColor: 'rgba(13, 40, 50, 0.6)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  weekItemCurrent: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderColor: '#14B8A6',
    borderWidth: 2,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  weekItemCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  weekItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekItemNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B4E4DD',
    letterSpacing: 0.3,
  },
  weekItemNumberCurrent: {
    color: '#14B8A6',
  },
  weekItemNumberCompleted: {
    color: '#10B981',
  },
  weekItemFocus: {
    fontSize: 12,
    color: '#6B8A84',
    lineHeight: 16,
  },
  currentBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FBBF24',
    letterSpacing: 0.5,
  },
  weeklyScheduleScroll: {
    marginHorizontal: -20, // Extend to edges
    paddingHorizontal: 20,
  },
  weekCard: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  weekCardCurrent: {
    backgroundColor: '#14B8A6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  weekCardCompleted: {
    backgroundColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  weekNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  weekFocus: {
    fontSize: 12,
    color: '#B4E4DD',
    textAlign: 'center',
    lineHeight: 16,
  },
  weekStatus: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  weekStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#14B8A6',
  },

  // ============================================================================
  // FLASHCARDS TAB - DARK THEME
  // ============================================================================
  flashcardsFilterContainer: {
    backgroundColor: 'rgba(11, 26, 31, 0.6)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterButtonActive: {
    backgroundColor: '#14B8A6',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14B8A6',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  flashcardsGrid: {
    gap: 12,
  },
  flashcardSetCard: {
    width: '48%',
    backgroundColor: 'rgba(11, 26, 31, 0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  flashcardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  flashcardSetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  flashcardSetMeta: {
    fontSize: 12,
    color: '#6B8A84',
    marginBottom: 10,
  },
  flashcardSetDescription: {
    fontSize: 12,
    color: '#B4E4DD',
    marginBottom: 12,
    lineHeight: 16,
  },
  studyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  studyButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Additional flashcard styles for component compatibility
  flashcardsContainer: {
    flex: 1,
    padding: 20,
  },
  flashcardFilterContainer: {
    backgroundColor: 'transparent',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  flashcardFilterSegment: {
    flexDirection: 'row',
    gap: 8,
  },
  flashcardFilterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  flashcardFilterButtonActive: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  flashcardFilterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  flashcardFilterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  flashcardGridRow: {
    gap: 12,
    marginBottom: 12,
  },
  flashcardGridContent: {
    paddingBottom: 20,
  },
  flashcardCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  flashcardCardPurple: {
    backgroundColor: '#8B5CF6', // Learning Plan - Vibrant purple
  },
  flashcardCardOrange: {
    backgroundColor: '#FB923C', // Practice - Vibrant orange
  },
  flashcardCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    marginBottom: 12,
    gap: 4,
  },
  flashcardCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flashcardCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  flashcardCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  flashcardCardInfo: {
    flex: 1,
  },
  flashcardCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  flashcardCardMeta: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.85,
  },
  flashcardCardDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  flashcardStudyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  flashcardStudyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },

  // ============================================================================
  // NOTIFICATIONS TAB - DARK THEME
  // ============================================================================
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  unreadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14B8A6',
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  notificationCardUnread: {
    backgroundColor: '#14B8A6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // Background color set dynamically based on type
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  notificationDate: {
    fontSize: 11,
    color: '#6B8A84',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#B4E4DD',
    lineHeight: 19,
  },
  notificationMessageExpanded: {
    fontSize: 13,
    color: '#B4E4DD',
    lineHeight: 19,
  },
  expandButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14B8A6',
  },

  // ============================================================================
  // CIRCULAR PROGRESS
  // ============================================================================
  circularProgress: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressPercentage: {
    fontSize: 20,
    fontWeight: '800',
  },

  // ============================================================================
  // HORIZONTAL PAGER & PAGES
  // ============================================================================
  pagerContainer: {
    flex: 1,
  },
  page: {
    width: width, // Full screen width per page
  },
  pageContent: {
    flex: 1,
    padding: 20,
  },

  // ============================================================================
  // SCROLL VIEW
  // ============================================================================
  scrollViewContent: {
    paddingBottom: 40,
  },

  // ============================================================================
  // MODALS
  // ============================================================================
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#0B1A1F', // Dark theme for settings modal
  },
  flashcardModalContainer: {
    flex: 1,
    backgroundColor: '#0B1A1F',
  },
  flashcardModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.2)',
  },
  flashcardModalTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  flashcardModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  flashcardModalSubtitle: {
    fontSize: 14,
    color: '#B4E4DD',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
});
