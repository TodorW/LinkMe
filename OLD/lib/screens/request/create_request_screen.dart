import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:linkme/core/auth_service.dart';
import 'package:linkme/core/firestore_service.dart';
import 'package:linkme/core/location_service.dart';

class CreateRequestScreen extends StatefulWidget {
  const CreateRequestScreen({super.key});

  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final FirestoreService _firestoreService = FirestoreService();
  final LocationService _locationService = LocationService();
  
  String _selectedCategory = 'Donošenje namirnica';
  String _selectedUrgency = 'medium';
  Map<String, dynamic>? _currentLocation;
  bool _isLoading = false;
  bool _gettingLocation = false;
  
  final List<String> _categories = [
    'Donošenje namirnica',
    'Čišćenje stana',
    'Fizička asistencija',
    'Pozajmljivanje alata',
    'Čuvanje djece',
    'Šetnja kućnih ljubimaca',
    'Pomoć u selidbi',
    'Popravka računara',
    'Vrtlarstvo',
    'Priprema obroka',
  ];
  
  final Map<String, String> _urgencyLabels = {
    'low': 'Nije hitno',
    'medium': 'Umjerena hitnost',
    'high': 'Hitno',
  };

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    setState(() {
      _gettingLocation = true;
    });
    
    try {
      final location = await _locationService.getCurrentLocation();
      setState(() {
        _currentLocation = location;
        _gettingLocation = false;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Greška pri dobavljanju lokacije: $e')),
      );
      setState(() {
        _gettingLocation = false;
      });
    }
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;
    if (_currentLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Molimo sačekajte lokaciju')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final userId = context.read<AuthService>().currentUser!.uid;
      
      await _firestoreService.createRequest(
        userId: userId,
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        category: _selectedCategory,
        latitude: _currentLocation!['latitude'],
        longitude: _currentLocation!['longitude'],
        address: _currentLocation!['address'],
        urgency: _selectedUrgency,
      );
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Zahtjev uspješno kreiran')),
      );
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Greška: $e')),
      );
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Novi zahtjev'),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _getCurrentLocation,
            tooltip: 'Osveži lokaciju',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Location Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: Colors.blue),
                          const SizedBox(width: 8),
                          Text(
                            _gettingLocation ? 'Dobavljam lokaciju...' : 'Vaša lokacija',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (_currentLocation != null)
                        Text(
                          _currentLocation!['address'],
                          style: const TextStyle(color: Colors.grey),
                        ),
                      if (_currentLocation == null && !_gettingLocation)
                        TextButton(
                          onPressed: _getCurrentLocation,
                          child: const Text('Dobavi lokaciju'),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Title
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Naslov zahtjeva',
                  hintText: 'npr. Treba mi pomoć sa kupovinom',
                  border: OutlineInputBorder(),
                ),
                maxLength: 100,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Unesite naslov';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              // Category
              const Text(
                'Kategorija pomoći',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                ),
                items: _categories.map((category) {
                  return DropdownMenuItem(
                    value: category,
                    child: Text(category),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedCategory = value!;
                  });
                },
              ),
              const SizedBox(height: 20),
              // Urgency
              const Text(
                'Hitnost',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              SegmentedButton<String>(
                segments: _urgencyLabels.entries.map((entry) {
                  return ButtonSegment(
                    value: entry.key,
                    label: Text(entry.value),
                    icon: Icon(
                      entry.key == 'high' ? Icons.warning : 
                      entry.key == 'medium' ? Icons.info : Icons.timer,
                    ),
                  );
                }).toList(),
                selected: {_selectedUrgency},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() {
                    _selectedUrgency = newSelection.first;
                  });
                },
              ),
              const SizedBox(height: 20),
              // Description
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Detaljan opis',
                  hintText: 'Opišite šta tačno trebate...',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                maxLines: 5,
                maxLength: 500,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Unesite opis';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 32),
              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submitRequest,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00C853),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text(
                          'Objavi zahtjev',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}