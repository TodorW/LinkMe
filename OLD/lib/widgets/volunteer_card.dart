import 'package:flutter/material.dart';

class VolunteerCard extends StatelessWidget {
  final String name;
  final double rating;
  final List<String> focusAreas;
  final int compatibilityScore;
  final VoidCallback onTap;

  const VolunteerCard({
    super.key,
    required this.name,
    required this.rating,
    required this.focusAreas,
    required this.compatibilityScore,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(right: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 160,
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Profile Image
              Center(
                child: CircleAvatar(
                  radius: 30,
                  backgroundColor: const Color(0xFF00C853).withOpacity(0.1),
                  child: const Icon(
                    Icons.person,
                    size: 30,
                    color: Color(0xFF00C853),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Name
              Text(
                name,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              // Rating
              Row(
                children: [
                  Icon(
                    Icons.star,
                    size: 16,
                    color: Colors.amber[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    rating.toStringAsFixed(1),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Focus Areas
              if (focusAreas.isNotEmpty)
                Text(
                  focusAreas.take(2).join(', '),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              const SizedBox(height: 8),
              // Compatibility Score
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: _getScoreColor(compatibilityScore).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _getScoreColor(compatibilityScore).withOpacity(0.3),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.bolt,
                      size: 12,
                      color: _getScoreColor(compatibilityScore),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '$compatibilityScore%',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _getScoreColor(compatibilityScore),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getScoreColor(int score) {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.blue;
    if (score >= 40) return Colors.orange;
    return Colors.red;
  }
}