import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../data/mock_data.dart';

class ContentProvider extends ChangeNotifier {
  List<Content> _trending = [];
  List<Content> _newReleases = [];
  List<Content> _popularFilms = [];
  List<Content> _popularSeries = [];
  List<Content> _cartoons = [];
  List<Content> _caribbean = [];
  List<Content> _recommended = [];
  List<Content> _continueWatching = [];
  List<Content> _myList = [];

  List<Content> get trending => _trending;
  List<Content> get newReleases => _newReleases;
  List<Content> get popularFilms => _popularFilms;
  List<Content> get popularSeries => _popularSeries;
  List<Content> get cartoons => _cartoons;
  List<Content> get caribbean => _caribbean;
  List<Content> get recommended => _recommended;
  List<Content> get continueWatching => _continueWatching;
  List<Content> get myList => _myList;

  Future<void> loadContent() async {
    _trending = [...MockData.films.take(3), ...MockData.series.take(2)];
    _newReleases = [...MockData.films.skip(2).take(3), ...MockData.series.skip(1).take(2)];
    _popularFilms = MockData.films;
    _popularSeries = MockData.series;
    _cartoons = MockData.cartoons;
    _caribbean = [...MockData.films.where((f) => f.isCaribbean), ...MockData.series.where((s) => s.isCaribbean)];
    _recommended = [...MockData.films.take(4), ...MockData.series.take(2)];
    _continueWatching = MockData.films.take(3).toList();
    _myList = [...MockData.films.skip(3).take(2), ...MockData.cartoons.take(1)];
    notifyListeners();
  }

  List<Content> getFilms() => MockData.films;
  List<Content> getSeries() => MockData.series;
  List<Content> getCartoons() => MockData.cartoons;

  List<Content> search(String query) {
    if (query.isEmpty) return [];
    final all = [...MockData.films, ...MockData.series, ...MockData.cartoons];
    return all.where((c) => c.title.toLowerCase().contains(query.toLowerCase())).toList();
  }
}

class AuthProvider extends ChangeNotifier {
  bool _isLoggedIn = false;
  User? _user;

  bool get isLoggedIn => _isLoggedIn;
  User? get user => _user;

  Future<bool> login(String email) async {
    _isLoggedIn = true;
    _user = User(id: '1', email: email, name: 'Sandro');
    notifyListeners();
    return true;
  }

  void logout() {
    _isLoggedIn = false;
    _user = null;
    notifyListeners();
  }
}

class ProfileProvider extends ChangeNotifier {
  List<Profile> _profiles = MockData.profiles;
  Profile? _selectedProfile;

  List<Profile> get profiles => _profiles;
  Profile? get selectedProfile => _selectedProfile;

  void selectProfile(Profile profile) {
    _selectedProfile = profile;
    notifyListeners();
  }
}
