import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:linkme/core/auth_service.dart';
import 'package:linkme/core/firestore_service.dart';
import 'package:linkme/widgets/rating_widget.dart';
import 'package:linkme/screens/chat/chat_screen.dart';

class RequestDetailScreen extends StatefulWidget {
  final String requestId;
  
  const RequestDetailScreen({
    super.key,
    required this.requestId,
  });
  
  @override
  State<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends State<RequestDetailScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  Map<String, dynamic>? _requestData;
  Map<String, dynamic>? _requesterData;
  Map<String, dynamic>? _volunteerData;
  bool _isLoading = true;
  bool _isCompleting = false;
  double _rating = 5.0;
  final TextEditingController _reviewController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    _loadRequestData();
  }
  
  Future<void> _loadRequestData() async {
    try {
      final requestDoc = await _firestoreService.requests.doc(widget.requestId).get();
      if (requestDoc.exists) {
        final requestData = requestDoc.data() as Map<String, dynamic>;
        setState(() {
          _requestData = requestData;
        });
        
        // Load requester data
        final requesterDoc = await _firestoreService.users.doc(requestData['userId']).get();
        if (requesterDoc.exists) {
          setState(() {
            _requesterData = requesterDoc.data() as Map<String, dynamic>;
          });
        }
        
        // Load volunteer data if accepted
        if (requestData['acceptedBy'] != null) {
          final volunteerDoc = await _firestoreService.users.doc(requestData['acceptedBy']).get();
          if (volunteerDoc.exists) {
            setState(() {
              _volunteerData = volunteerDoc.data() as Map<String, dynamic>;
            });
          }
        }
      }
    } catch (e) {
      print('Error loading request: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  Future<void> _completeRequest() async {
    if (_reviewController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unesite komentar')),
      );
      return;
    }
    
    setState(() {
      _isCompleting = true;
    });
    
    try {
      await _firestoreService.completeRequest(
        widget.requestId,
        _rating,
        _reviewController.text.trim(),
      );
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Zahtjev završen')),
      );
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Greška: $e')),
      );
    } finally {
      setState(() {
        _isCompleting = false;
      });
    }
  }
  
  Future<void> _startChat() async {
    final currentUserId = context.read<AuthService>().currentUser!.uid;
    final role = context.read<AuthService>().getUserData(currentUserId);
    
    String otherUserId;
    String otherUserName;
    
    if ((await role)?['role'] == 'volunteer') {
      otherUserId = _requestData?['userId'] ?? '';
      otherUserName = _requesterData?['name'] ?? 'Korisnik';
    } else {
      otherUserId = _requestData?['acceptedBy'] ?? '';
      otherUserName = _volunteerData?['name'] ?? 'Volonter';
    }
    
    if (otherUserId.isNotEmpty) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ChatScreen(
            chatId: '$currentUserId-$otherUserId-${widget.requestId}',
            otherUserId: otherUserId,
            otherUserName: otherUserName,
          ),
        ),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    if (_requestData == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Detalji zahtjeva')),
        body: const Center(child: Text('Zahtjev nije pronađen')),
      );
    }
    
    final status = _requestData!['status'];
    final isUser = context.read<AuthService>().currentUser!.uid == _requestData!['userId'];
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalji zahtjeva'),
        actions: [
          if (status == 'accepted')
            IconButton(
              icon: const Icon(Icons.chat),
              onPressed: _startChat,
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _getStatusColor(status).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _getStatusColor(status).withOpacity(0.3),
                ),
              ),
              child: Column(
                children: [
                  Text(
                    _getStatusText(status),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: _getStatusColor(status),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _getStatusDescription(status),
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Request Details
            const Text(
              'Detalji zahtjeva',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _DetailRow(
              icon: Icons.title,
              label: 'Naslov',
              value: _requestData!['title'] ?? '',
            ),
            const SizedBox(height: 12),
            _DetailRow(
              icon: Icons.category,
              label: 'Kategorija',
              value: _requestData!['category'] ?? '',
            ),
            const SizedBox(height: 12),
            _DetailRow(
              icon: Icons.description,
              label: 'Opis',
              value: _requestData!['description'] ?? '',
            ),
            const SizedBox(height: 12),
            _DetailRow(
              icon: Icons.location_on,
              label: 'Lokacija',
              value: _requestData!['address'] ?? '',
            ),
            const SizedBox(height: 12),
            _DetailRow(
              icon: Icons.access_time,
              label: 'Kreirano',
              value: _formatDate(_requestData!['createdAt']?.toDate()),
            ),
            const SizedBox(height: 24),
            // People Involved
            const Text(
              'Uključene osobe',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            if (_requesterData != null)
              _PersonCard(
                name: _requesterData!['name'] ?? 'Korisnik',
                role: 'Traži pomoć',
                rating: _requesterData!['rating']?.toDouble() ?? 5.0,
              ),
            const SizedBox(height: 12),
            if (_volunteerData != null)
              _PersonCard(
                name: _volunteerData!['name'] ?? 'Volonter',
                role: 'Pruža pomoć',
                rating: _volunteerData!['rating']?.toDouble() ?? 5.0,
                focusAreas: List<String>.from(_volunteerData!['focusAreas'] ?? []),
              ),
            // Completion Form (for user when request is accepted)
            if (isUser && status == 'accepted') ...[
              const SizedBox(height: 32),
              const Text(
                'Ocijenite pomoć',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Kako je prošla pomoć?',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              RatingWidget(
                initialRating: _rating,
                onRatingChanged: (rating) => setState(() => _rating = rating),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: _reviewController,
                decoration: const InputDecoration(
                  labelText: 'Komentar (opciono)',
                  border: OutlineInputBorder(),
                  hintText: 'Opišite kako je prošla pomoć...',
                ),
                maxLines: 4,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isCompleting ? null : _completeRequest,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00C853),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isCompleting
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text(
                          'Završi i ocijeni',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
  
  Color _getStatusColor(String status) {
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
  
  String _getStatusText(String status) {
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
        return status;
    }
  }
  
  String _getStatusDescription(String status) {
    switch (status) {
      case 'pending':
        return 'Zahtjev čeka na volontera';
      case 'accepted':
        return 'Volonter je prihvatio zahtjev';
      case 'completed':
        return 'Pomoć je uspješno završena';
      case 'cancelled':
        return 'Zahtjev je otkazan';
      default:
        return '';
    }
  }
  
  String _formatDate(DateTime? date) {
    if (date == null) return 'Nepoznato';
    return '${date.day}.${date.month}.${date.year}. ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });
  
  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Colors.grey, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PersonCard extends StatelessWidget {
  final String name;
  final String role;
  final double rating;
  final List<String>? focusAreas;
  
  const _PersonCard({
    required this.name,
    required this.role,
    required this.rating,
    this.focusAreas,
  });
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const CircleAvatar(
              radius: 24,
              child: Icon(Icons.person),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    role,
                    style: const TextStyle(color: Colors.grey),
                  ),
                  if (focusAreas != null && focusAreas!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      focusAreas!.take(2).join(', '),
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.blue,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Column(
              children: [
                Row(
                  children: [
                    const Icon(Icons.star, size: 16, color: Colors.amber),
                    const SizedBox(width: 4),
                    Text(
                      rating.toStringAsFixed(1),
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}