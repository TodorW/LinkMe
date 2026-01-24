import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';

class AuthService with ChangeNotifier{
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  User? get currentUser => _auth.currentUser;
  
  Stream<User?> get authStateChanges => _auth.authStateChanges();
  
  String _hashJMBG(String jmbg) {
    return sha256.convert(utf8.encode(jmbg)).toString();
  }
  
  Future<UserCredential?> registerWithEmail({
    required String email,
    required String password,
    required String jmbg,
    required String name,
    required String role,
    List<String>? focusAreas,
  }) async {
    try {
      final hashedJMBG = _hashJMBG(jmbg);
      
      // Check if JMBG already exists
      final jmbgQuery = await _firestore
          .collection('users')
          .where('hashedJMBG', isEqualTo: hashedJMBG)
          .get();
      
      if (jmbgQuery.docs.isNotEmpty) {
        throw Exception('JMBG već postoji u sistemu');
      }
      
      // Create user
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      // Save user data
      await _firestore.collection('users').doc(userCredential.user!.uid).set({
        'uid': userCredential.user!.uid,
        'email': email,
        'hashedJMBG': hashedJMBG,
        'name': name,
        'role': role,
        'focusAreas': focusAreas ?? [],
        'rating': 5.0,
        'totalRatings': 0,
        'createdAt': FieldValue.serverTimestamp(),
        'location': null,
        'isAvailable': true,
      });
      
      return userCredential;
    } catch (e) {
      rethrow;
    }
  }
  
  Future<UserCredential?> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      rethrow;
    }
  }
  
  Future<void> signOut() async {
    await _auth.signOut();
  }
  
  Future<Map<String, dynamic>?> getUserData(String uid) async {
    try {
      final doc = await _firestore.collection('users').doc(uid).get();
      return doc.data();
    } catch (e) {
      return null;
    }
  }
  
  Future<void> updateUserRole(String uid, String role) async {
    await _firestore.collection('users').doc(uid).update({
      'role': role,
    });
  }
  
  Future<void> updateUserFocusAreas(String uid, List<String> focusAreas) async {
    await _firestore.collection('users').doc(uid).update({
      'focusAreas': focusAreas,
    });
  }
  
  Future<void> updateUserLocation(
    String uid, 
    double latitude, 
    double longitude,
    String address,
  ) async {
    await _firestore.collection('users').doc(uid).update({
      'location': GeoPoint(latitude, longitude),
      'address': address,
      'lastLocationUpdate': FieldValue.serverTimestamp(),
    });
  }
}