import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#262626',
  },
  closeButton: {
    padding: wp('2%'),
  },
  commentsList: {
    paddingTop: hp('2%'),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('10%'),
  },
  emptyText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#262626',
    marginBottom: hp('1%'),
  },
  emptySubText: {
    fontSize: wp('4%'),
    color: '#8E8E8E',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
  },
  selectedImageContainer: {
    marginBottom: hp('2%'),
  },
  selectedImage: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('2%'),
  },
  removeImageButton: {
    position: 'absolute',
    top: wp('1%'),
    right: wp('1%'),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: wp('4%'),
    padding: wp('1%'),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  imageButton: {
    padding: wp('2%'),
    marginRight: wp('2%'),
  },
  input: {
    flex: 1,
    minHeight: hp('5%'),
    maxHeight: hp('15%'),
    fontSize: wp('4%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    backgroundColor: '#F9F9F9',
    borderRadius: wp('5%'),
  },
  sendButton: {
    marginLeft: wp('2%'),
    padding: wp('2%'),
    backgroundColor: '#0095F6',
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B2DFFC',
  },
  loginPrompt: {
    padding: hp('2%'),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    backgroundColor: '#fff',
  },
  loginPromptText: {
    fontSize: wp('4%'),
    color: '#0095F6',
  },
  // Comment Item Styles
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  commentAvatar: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    marginRight: wp('3%'),
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('0.5%'),
  },
  commentUsername: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#262626',
  },
  commentText: {
    fontSize: wp('4%'),
    color: '#262626',
    marginBottom: hp('1%'),
  },
  commentImage: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: wp('2%'),
    marginBottom: hp('1%'),
  },
  commentTime: {
    fontSize: wp('3.5%'),
    color: '#8E8E8E',
  },
  deleteButton: {
    padding: wp('1%'),
  },
});
