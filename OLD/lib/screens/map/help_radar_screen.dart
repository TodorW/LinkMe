import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import 'package:linkme/core/auth_service.dart';
import 'package:linkme/core/firestore_service.dart';
import 'package:linkme/core/location_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class HelpRadarScreen extends StatefulWidget {
  const HelpRadarScreen({super.key});

  @override
  State<HelpRadarScreen> createState() => _HelpRadarScreenState();
}

class _HelpRadarScreenState extends State<HelpRadarScreen> {
  late GoogleMapController _mapController;
  final LocationService _locationService = LocationService();
  final FirestoreService _firestoreService = FirestoreService();
  Map<String, dynamic>? _currentLocation;
  Set<Marker> _markers = {};
  Set<Circle> _circles = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    try {
      final location = await _locationService.getCurrentLocation();
      setState(() {
        _currentLocation = location;
        _isLoading = false;
      });
      _loadMapData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Greška: $e')),
      );
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _loadMapData() async {
    final userId = context.read<AuthService>().currentUser!.uid;
    final userData = await context.read<AuthService>().getUserData(userId);
    final role = userData?['role'] ?? 'user';

    final markers = <Marker>{};
    final circles = <Circle>{};

    // Add current location marker
    if (_currentLocation != null) {
      final currentLatLng = LatLng(
        _currentLocation!['latitude'],
        _currentLocation!['longitude'],
      );

      markers.add(
        Marker(
          markerId: const MarkerId('current_location'),
          position: currentLatLng,
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
          infoWindow: const InfoWindow(title: 'Vi ste ovdje'),
        ),
      );

      circles.add(
        Circle(
          circleId: const CircleId('search_radius'),
          center: currentLatLng,
          radius: 5000, // 5km
          strokeWidth: 2,
          strokeColor: Colors.blue.withOpacity(0.5),
          fillColor: Colors.blue.withOpacity(0.1),
        ),
      );
    }

    if (role == 'user') {
      // Show volunteers for users
      await _loadVolunteers(markers);
    } else {
      // Show requests for volunteers
      await _loadRequests(markers);
    }

    setState(() {
      _markers = markers;
      _circles = circles;
    });
  }

  Future<void> _loadVolunteers(Set<Marker> markers) async {
    final volunteers = await _firestoreService.users
        .where('role', isEqualTo: 'volunteer')
        .where('isAvailable', isEqualTo: true)
        .get();

    int markerCount = 0;
    for (final doc in volunteers.docs) {
      final volunteer = doc.data() as Map<String, dynamic>;
      final location = volunteer['location'] as GeoPoint?;
      
      if (location != null && markerCount < 20) { // Limit markers
        markers.add(
          Marker(
            markerId: MarkerId('volunteer_${doc.id}'),
            position: LatLng(location.latitude, location.longitude),
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
            infoWindow: InfoWindow(
              title: volunteer['name'] ?? 'Volonter',
              snippet: 'Ocjena: ${volunteer['rating']?.toStringAsFixed(1) ?? '5.0'}',
            ),
          ),
        );
        markerCount++;
      }
    }
  }

  Future<void> _loadRequests(Set<Marker> markers) async {
    final requests = await _firestoreService.requests
        .where('status', isEqualTo: 'pending')
        .get();

    int markerCount = 0;
    for (final doc in requests.docs) {
      final request = doc.data() as Map<String, dynamic>;
      final location = request['location'] as GeoPoint?;
      
      if (location != null && markerCount < 30) { // Limit markers
        final hue = request['urgency'] == 'high'
            ? BitmapDescriptor.hueRed
            : request['urgency'] == 'medium'
                ? BitmapDescriptor.hueOrange
                : BitmapDescriptor.hueYellow;

        markers.add(
          Marker(
            markerId: MarkerId('request_${doc.id}'),
            position: LatLng(location.latitude, location.longitude),
            icon: BitmapDescriptor.defaultMarkerWithHue(hue),
            infoWindow: InfoWindow(
              title: request['title'] ?? 'Zahtjev',
              snippet: request['category'] ?? 'Pomoć',
            ),
          ),
        );
        markerCount++;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Help Radar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadMapData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _currentLocation == null
              ? const Center(child: Text('Lokacija nije dostupna'))
              : GoogleMap(
                  onMapCreated: (controller) => _mapController = controller,
                  initialCameraPosition: CameraPosition(
                    target: LatLng(
                      _currentLocation!['latitude'],
                      _currentLocation!['longitude'],
                    ),
                    zoom: 12,
                  ),
                  markers: _markers,
                  circles: _circles,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: true,
                  zoomControlsEnabled: true,
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          if (_currentLocation != null) {
            _mapController.animateCamera(
              CameraUpdate.newLatLng(
                LatLng(
                  _currentLocation!['latitude'],
                  _currentLocation!['longitude'],
                ),
              ),
            );
          }
        },
        child: const Icon(Icons.my_location),
      ),
    );
  }
}