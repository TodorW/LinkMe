import 'package:flutter/material.dart';

class RatingWidget extends StatefulWidget {
  final double initialRating;
  final ValueChanged<double> onRatingChanged;
  final bool readOnly;

  const RatingWidget({
    super.key,
    this.initialRating = 0,
    required this.onRatingChanged,
    this.readOnly = false,
  });

  @override
  State<RatingWidget> createState() => _RatingWidgetState();
}

class _RatingWidgetState extends State<RatingWidget> {
  late double _currentRating;

  @override
  void initState() {
    super.initState();
    _currentRating = widget.initialRating;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        return GestureDetector(
          onTap: widget.readOnly
              ? null
              : () {
                  setState(() {
                    _currentRating = index + 1.0;
                  });
                  widget.onRatingChanged(_currentRating);
                },
          child: Icon(
            index < _currentRating.floor()
                ? Icons.star
                : index < _currentRating
                    ? Icons.star_half
                    : Icons.star_border,
            color: Colors.amber,
            size: 40,
          ),
        );
      }),
    );
  }
}