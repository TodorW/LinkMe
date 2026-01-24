import 'package:cloud_firestore/cloud_firestore.dart';  // <-- DODAJTE OVO
import 'package:flutter/material.dart';

class RequestModel {
  final String id;
  final String userId;
  final String title;
  final String description;
  final String category;
  final GeoPoint location;  // <-- Firebase GeoPoint
  final String address;
  final String urgency; // low, medium, high
  final String status; // pending, accepted, completed, cancelled
  final String? acceptedBy;
  final double? rating;
  final String? review;
  final DateTime createdAt;
  final DateTime? acceptedAt;
  final DateTime? completedAt;
  
  RequestModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.category,
    required this.location,
    required this.address,
    required this.urgency,
    required this.status,
    this.acceptedBy,
    this.rating,
    this.review,
    required this.createdAt,
    this.acceptedAt,
    this.completedAt,
  });
  
  factory RequestModel.fromMap(Map<String, dynamic> data, String id) {
    return RequestModel(
      id: id,
      userId: data['userId'] ?? '',
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      category: data['category'] ?? '',
      location: GeoPoint(
        data['location'].latitude,
        data['location'].longitude,
      ),
      address: data['address'] ?? '',
      urgency: data['urgency'] ?? 'medium',
      status: data['status'] ?? 'pending',
      acceptedBy: data['acceptedBy'],
      rating: data['rating']?.toDouble(),
      review: data['review'],
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      acceptedAt: (data['acceptedAt'] as Timestamp?)?.toDate(),
      completedAt: (data['completedAt'] as Timestamp?)?.toDate(),
    );
  }
  
  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'title': title,
      'description': description,
      'category': category,
      'location': location,
      'address': address,
      'urgency': urgency,
      'status': status,
      'acceptedBy': acceptedBy,
      'rating': rating,
      'review': review,
      'createdAt': Timestamp.fromDate(createdAt),
      'acceptedAt': acceptedAt != null ? Timestamp.fromDate(acceptedAt!) : null,
      'completedAt': completedAt != null ? Timestamp.fromDate(completedAt!) : null,
    };
  }
  
  String get statusText {
    switch (status) {
      case 'pending':
        return 'Čeka pomoć';
      case 'accepted':
        return 'Prihvaćeno';
      case 'completed':
        return 'Završeno';
      case 'cancelled':
        return 'Otkazano';
      default:
        return 'Nepoznato';
    }
  }
  
  Color get statusColor {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'accepted':
        return Colors.blue;
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}