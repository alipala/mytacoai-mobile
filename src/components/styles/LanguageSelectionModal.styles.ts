import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export { height };

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  planButtonActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#4ECFBF',
  },
  planButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  planButtonContent: {
    flex: 1,
  },
  planButtonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F766E',
    marginBottom: 2,
  },
  planButtonSubtitle: {
    fontSize: 12,
    color: '#14B8A6',
    marginTop: 4,
  },
  planButtonChevron: {
    fontSize: 20,
    color: '#14B8A6',
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  languageButtonSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#4ECFBF',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 10,
  },
  languageName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  languageNameSelected: {
    color: '#0F766E',
  },
  levelGrid: {
    gap: 10,
  },
  levelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  levelButtonSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#4ECFBF',
  },
  levelCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    minWidth: 36,
  },
  levelCodeSelected: {
    color: '#0F766E',
  },
  levelDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  levelDescriptionSelected: {
    color: '#14B8A6',
  },
  infoBox: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECFBF',
  },
  infoText: {
    fontSize: 13,
    color: '#0F766E',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  applyButton: {
    backgroundColor: '#4ECFBF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4ECFBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
