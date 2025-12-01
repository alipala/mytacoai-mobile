import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingVertical: 18, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#1F2937' },

  // Premium Segmented Control Tabs
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 6,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContent: {
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#4FD1C5',
    fontWeight: '700',
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
    borderColor: '#FFFFFF',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: { flex: 1, padding: 20 },

  // Welcome
  welcomeSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#14B8A6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  welcomeText: { flex: 1 },
  welcomeTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 14, color: '#6B7280' },

  // Stats
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },

  // Activity
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  activityList: { gap: 12 },
  activityCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  activitySubtitle: { fontSize: 12, color: '#6B7280' },
  activityDate: { fontSize: 11, color: '#9CA3AF' },
  activityDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  activitySummary: { fontSize: 13, color: '#4B5563', lineHeight: 20 },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },

  // Progress Tab - IMPROVED DESIGN
  progressPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  progressPlanHeaderLeft: {
    flex: 1,
    marginRight: 16
  },
  progressPlanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4
  },
  progressPlanSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  progressPlanContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Skills Grid - TRUE HORIZONTAL 2 COLUMNS
  skillsGridHorizontal: {
    flexDirection: 'row',
    gap: 10,
  },
  skillColumn: {
    flex: 1,
    gap: 8,
  },
  skillCardHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  skillIconHorizontal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillInfo: {
    flex: 1,
  },
  skillLabelHorizontal: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  skillScoreHorizontal: {
    fontSize: 20,
    fontWeight: '700',
  },
  currentWeekActivities: {
    gap: 8,
  },
  activityBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3B82F6',
    marginTop: 6,
  },
  activityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  activityRowText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  weeklyScheduleSection: {
    marginTop: 8,
  },
  weeklyScheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  weeksList: {
    gap: 8,
  },
  weekItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  weekItemCurrent: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  weekItemCompleted: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  weekItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekItemNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  weekItemNumberCurrent: {
    color: '#1E40AF',
  },
  weekItemNumberCompleted: {
    color: '#047857',
  },
  currentBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weekItemFocus: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },

  // Old styles kept for compatibility
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  progressHeaderText: { flex: 1, marginRight: 16 },
  progressTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  progressSubtitle: { fontSize: 13, color: '#6B7280' },
  circularProgress: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  circularProgressText: { position: 'absolute' },
  circularProgressPercentage: { fontSize: 20, fontWeight: '700' },

  // Skills Grid
  skillsSection: { marginBottom: 20 },
  skillsSectionTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillCard: { width: (width - 80) / 2, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, alignItems: 'center' },
  skillIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  skillLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4, textAlign: 'center' },
  skillScore: { fontSize: 22, fontWeight: '700' },

  // Current Week
  currentWeekSection: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  currentWeekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  currentWeekLabel: { fontSize: 12, fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase' },
  weekBadge: { backgroundColor: '#3B82F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  weekBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  currentWeekFocus: { fontSize: 15, fontWeight: '600', color: '#1F2937' },

  // Swipeable Tab Pager
  pagerContainer: {
    flex: 1,
  },
  page: {
    width: width,
  },
  pageContent: {
    flex: 1,
  },

  // Flashcards - GRID
  flashcardsContainer: { flex: 1 },
  flashcardGridContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  flashcardGridRow: { gap: 12, marginBottom: 12 },
  flashcardCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6' },
  flashcardCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  flashcardCardIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  flashcardCardInfo: { flex: 1 },
  flashcardCardTitle: { fontSize: 13, fontWeight: '700', color: '#1F2937', marginBottom: 3 },
  flashcardCardMeta: { fontSize: 10, color: '#9CA3AF' },
  flashcardCardDescription: { fontSize: 11, color: '#6B7280', lineHeight: 16, marginBottom: 12, minHeight: 32 },
  flashcardStudyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F75A5A', borderRadius: 10, paddingVertical: 10, gap: 6 },
  flashcardStudyButtonText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  // Notifications
  unreadBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginLeft: 'auto', marginBottom: 16 },
  unreadBadgeText: { fontSize: 12, fontWeight: '600', color: '#991B1B' },
  notificationList: { gap: 12 },
  notificationCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  notificationCardUnread: { borderColor: '#14B8A6', borderWidth: 2 },
  notificationHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  notificationIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  notificationHeaderInfo: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  notificationDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  notificationContent: { fontSize: 14, color: '#4B5563', lineHeight: 20 },

  // Modal
  flashcardModalContainer: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 50 },
  flashcardModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 2, borderBottomColor: '#E5E7EB', elevation: 3 },
  closeButton: { padding: 4, width: 44 },
  flashcardModalTitleContainer: { flex: 1, alignItems: 'center' },
  flashcardModalTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', textAlign: 'center' },
  flashcardModalSubtitle: { fontSize: 12, fontWeight: '500', color: '#6B7280', marginTop: 2, textAlign: 'center' },
  headerSpacer: { width: 44 },
});
