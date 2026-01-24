import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String uid;
  final String email;
  final String name;
  final String role; // 'user' or 'volunteer'
  final List<String> focusAreas;
  final double rating;
  final int totalRatings;
  final GeoPoint? location;  // <-- Ovo je sada Firebase GeoPoint
  final String? address;
  final bool isAvailable;
  final DateTime createdAt;
  
  UserModel({
    required this.uid,
    required this.email,
    required this.name,
    required this.role,
    required this.focusAreas,
    required this.rating,
    required this.totalRatings,
    this.location,
    this.address,
    required this.isAvailable,
    required this.createdAt,
  });
  
  factory UserModel.fromMap(Map<String, dynamic> data) {
    return UserModel(
      uid: data['uid'] ?? '',
      email: data['email'] ?? '',
      name: data['name'] ?? '',
      role: data['role'] ?? 'user',
      focusAreas: List<String>.from(data['focusAreas'] ?? []),
      rating: (data['rating'] ?? 5.0).toDouble(),
      totalRatings: data['totalRatings'] ?? 0,
      location: data['location'],
      address: data['address'],
      isAvailable: data['isAvailable'] ?? true,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
  
  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'name': name,
      'role': role,
      'focusAreas': focusAreas,
      'rating': rating,
      'totalRatings': totalRatings,
      'location': location,
      'address': address,
      'isAvailable': isAvailable,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
/*
class GeoPoint {
  final double latitude;
  final double longitude;
  
  GeoPoint(this.latitude, this.longitude);
}
*/
