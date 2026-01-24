import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

class LocationService {
  Future<bool> checkPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }
    
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      return false;
    }
    
    return true;
  }
  
  Future<Position> getCurrentPosition() async {
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.best,
    );
  }
  
  Future<String> getAddressFromCoordinates(double lat, double lng) async {
    try {
      final placemarks = await placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        final placemark = placemarks.first;
        return '${placemark.street}, ${placemark.locality}';
      }
      return '$lat, $lng';
    } catch (e) {
      return '$lat, $lng';
    }
  }
  
  Future<Map<String, dynamic>> getCurrentLocation() async {
    final hasPermission = await checkPermissions();
    if (!hasPermission) {
      throw Exception('Location permission required');
    }
    
    final position = await getCurrentPosition();
    final address = await getAddressFromCoordinates(
      position.latitude,
      position.longitude,
    );
    
    return {
      'latitude': position.latitude,
      'longitude': position.longitude,
      'address': address,
    };
  }
  
  double calculateDistance(
    double lat1, 
    double lng1, 
    double lat2, 
    double lng2,
  ) {
    return Geolocator.distanceBetween(lat1, lng1, lat2, lng2);
  }
}