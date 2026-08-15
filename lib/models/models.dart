import 'package:flutter/material.dart';

class Content {
  final String id;
  final String title;
  final String description;
  final String posterUrl;
  final String backdropUrl;
  final String trailerUrl;
  final int year;
  final String duration;
  final double rating;
  final String genre;
  final String type; // film, series, cartoon
  final String country;
  final String language;
  final List<String> cast;
  final String director;
  final int seasons;
  final int episodes;
  final String maturityRating;
  final bool isCaribbean;
  final bool isOriginal;

  Content({
    required this.id,
    required this.title,
    required this.description,
    this.posterUrl = '',
    this.backdropUrl = '',
    this.trailerUrl = '',
    this.year = 2024,
    this.duration = '',
    this.rating = 0.0,
    this.genre = '',
    this.type = 'film',
    this.country = '',
    this.language = 'Français',
    this.cast = const [],
    this.director = '',
    this.seasons = 0,
    this.episodes = 0,
    this.maturityRating = 'TP',
    this.isCaribbean = false,
    this.isOriginal = false,
  });
}

class Profile {
  final String id;
  final String name;
  final String avatarUrl;
  final Color color;
  final bool isKids;
  final String? pin;

  Profile({
    required this.id,
    required this.name,
    this.avatarUrl = '',
    this.color = Colors.blue,
    this.isKids = false,
    this.pin,
  });
}

class User {
  final String id;
  final String email;
  final String name;
  final String subscriptionType; // free, standard, premium
  final DateTime? subscriptionExpiry;
  final List<Profile> profiles;
  final String? avatarUrl;

  User({
    required this.id,
    required this.email,
    this.name = '',
    this.subscriptionType = 'free',
    this.subscriptionExpiry,
    this.profiles = const [],
    this.avatarUrl,
  });
}

class Subscription {
  final String id;
  final String name;
  final double price;
  final String quality;
  final int devices;
  final List<String> features;
  final bool isPopular;

  Subscription({
    required this.id,
    required this.name,
    required this.price,
    this.qualité = 'HD',
    this.devices = 1,
    this.features = const [],
    this.isPopular = false,
  });
}
