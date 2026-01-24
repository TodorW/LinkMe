import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geolocator/geolocator.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  // Requests Collection
  CollectionReference get requests => _firestore.collection('requests');
  
  // Users Collection
  CollectionReference get users => _firestore.collection('users');
  
  // Chats Collection
  CollectionReference get chats => _firestore.collection('chats');
  
  // Messages Subcollection
  CollectionReference messages(String chatId) {
    return chats.doc(chatId).collection('messages');
  }
  
  // Create new help request
  Future<void> createRequest({
    required String userId,
    required String title,
    required String description,
    required String category,
    required double latitude,
    required double longitude,
    required String address,
    String? urgency,
  }) async {
    await requests.add({
      'userId': userId,
      'title': title,
      'description': description,
      'category': category,
      'location': GeoPoint(latitude, longitude),
      'address': address,
      'urgency': urgency ?? 'medium',
      'status': 'pending', // pending, accepted, completed, cancelled
      'acceptedBy': null,
      'createdAt': FieldValue.serverTimestamp(),
      'completedAt': null,
      'rating': null,
    });
  }
  
  // Get requests for volunteers (filtered by location and focus areas)
  Stream<QuerySnapshot> getNearbyRequests(
    double latitude, 
    double longitude, 
    List<String> focusAreas,
    double radiusKm,
  ) {
    // For MVP, we'll filter on client side
    return requests
        .where('status', isEqualTo: 'pending')
        .orderBy('createdAt', descending: true)
        .snapshots();
  }
  
  // Get user's requests
  Stream<QuerySnapshot> getUserRequests(String userId) {
    return requests
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots();
  }
  
  // Accept a request
  Future<void> acceptRequest(String requestId, String volunteerId) async {
    await requests.doc(requestId).update({
      'status': 'accepted',
      'acceptedBy': volunteerId,
      'acceptedAt': FieldValue.serverTimestamp(),
    });
    
    // Create chat between users
    final requestDoc = await requests.doc(requestId).get();
    final requestData = requestDoc.data() as Map<String, dynamic>;
    final requesterId = requestData['userId'];
    
    await createChat(requesterId, volunteerId, requestId);
  }
  
  // Complete a request with rating
  Future<void> completeRequest(String requestId, double rating, String review) async {
    final requestDoc = await requests.doc(requestId).get();
    final requestData = requestDoc.data() as Map<String, dynamic>;
    final volunteerId = requestData['acceptedBy'];
    
    // Update request
    await requests.doc(requestId).update({
      'status': 'completed',
      'completedAt': FieldValue.serverTimestamp(),
      'rating': rating,
      'review': review,
    });
    
    // Update volunteer's rating
    if (volunteerId != null) {
      await _updateUserRating(volunteerId, rating);
    }
  }
  
  // Update user's rating
  Future<void> _updateUserRating(String userId, double newRating) async {
    final userDoc = await users.doc(userId).get();
    final userData = userDoc.data() as Map<String, dynamic>;
    
    final currentRating = userData['rating'] ?? 5.0;
    final totalRatings = userData['totalRatings'] ?? 0;
    
    final updatedTotalRatings = totalRatings + 1;
    final updatedRating = ((currentRating * totalRatings) + newRating) / updatedTotalRatings;
    
    await users.doc(userId).update({
      'rating': updatedRating,
      'totalRatings': updatedTotalRatings,
    });
  }
  
  // Create chat between users
  Future<void> createChat(String user1Id, String user2Id, String requestId) async {
    final chatId = '$user1Id-$user2Id-$requestId';
    
    final usersData = await Future.wait([
      users.doc(user1Id).get(),
      users.doc(user2Id).get(),
    ]);
    
    final user1Data = usersData[0].data() as Map<String, dynamic>;
    final user2Data = usersData[1].data() as Map<String, dynamic>;
    
    await chats.doc(chatId).set({
      'id': chatId,
      'participants': [user1Id, user2Id],
      'participantNames': {
        user1Id: user1Data['name'],
        user2Id: user2Data['name'],
      },
      'requestId': requestId,
      'createdAt': FieldValue.serverTimestamp(),
      'lastMessage': null,
      'lastMessageTime': null,
    });
  }
  
  // Send message
  Future<void> sendMessage({
    required String chatId,
    required String senderId,
    required String text,
  }) async {
    final messageRef = messages(chatId).doc();
    
    await messageRef.set({
      'id': messageRef.id,
      'senderId': senderId,
      'text': text,
      'timestamp': FieldValue.serverTimestamp(),
      'read': false,
    });
    
    // Update chat last message
    await chats.doc(chatId).update({
      'lastMessage': text,
      'lastMessageTime': FieldValue.serverTimestamp(),
    });
  }
  
  // Get user's chats
  Stream<QuerySnapshot> getUserChats(String userId) {
    return chats
        .where('participants', arrayContains: userId)
        .orderBy('lastMessageTime', descending: true)
        .snapshots();
  }
  
  // Get chat messages
  Stream<QuerySnapshot> getChatMessages(String chatId) {
    return messages(chatId)
        .orderBy('timestamp', descending: false)
        .snapshots();
  }
  
  // AI Matching Simulation
  Future<List<Map<String, dynamic>>> getAIRecommendations(
    String userId, 
    List<String> focusAreas,
    GeoPoint location,
  ) async {
    final allUsers = await users
        .where('role', isEqualTo: 'volunteer')
        .where('isAvailable', isEqualTo: true)
        .get();
    
    final recommendations = <Map<String, dynamic>>[];
    
    for (final doc in allUsers.docs) {
      final userData = doc.data() as Map<String, dynamic>;
      
      // Calculate compatibility score
      double score = 0;
      
      // Focus areas match
      final userFocusAreas = (userData['focusAreas'] as List<dynamic>?)?.cast<String>() ?? [];
      final commonFocusAreas = userFocusAreas.where((area) => focusAreas.contains(area)).length;
      score += commonFocusAreas * 20;
      
      // Rating bonus
      final rating = userData['rating'] ?? 5.0;
      score += rating * 2;
      
      // Location bonus (if available)
      final userLocation = userData['location'] as GeoPoint?;
      if (userLocation != null) {
        final distance = Geolocator.distanceBetween(
          location.latitude,
          location.longitude,
          userLocation.latitude,
          userLocation.longitude,
        );
        
        if (distance < 5000) { // 5km
          score += 30;
        } else if (distance < 10000) { // 10km
          score += 15;
        }
      }
      
      if (score > 0) {
        recommendations.add({
          ...userData,
          'id': doc.id,
          'compatibilityScore': score.round(),
        });
      }
    }
    
    recommendations.sort((a, b) => b['compatibilityScore'].compareTo(a['compatibilityScore']));
    return recommendations.take(5).toList();
  }
}